import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from '../config';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import '../styles/Appointments.css';

interface Appointment {
  id?: number;
  doctor_name: string;
  doctor_place_id?: string;
  appointment_time: string;
  reason: string;
  created_at?: string;
}

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<Appointment>({
    doctor_name: '',
    appointment_time: '',
    reason: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [token, navigate]);

  const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
      dispatch(logout());
      navigate('/login');
    } else {
      toast.error(error.response?.data?.detail || 'An error occurred');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/appointments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else if (response.status === 401) {
        handleAuthError({ response });
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const appointmentData = {
      ...formData,
      appointment_time: selectedDate.toISOString()
    };

    try {
      const url = editingId 
        ? `${API_BASE_URL}/auth/appointments/${editingId}/`
        : `${API_BASE_URL}/auth/appointments/`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        toast.success(editingId ? 'Appointment updated!' : 'Appointment created!');
        setIsFormOpen(false);
        setFormData({
          doctor_name: '',
          appointment_time: '',
          reason: ''
        });
        setEditingId(null);
        fetchAppointments();
      } else if (response.status === 401) {
        handleAuthError({ response });
      } else {
        toast.error('Failed to save appointment');
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      doctor_name: appointment.doctor_name,
      appointment_time: appointment.appointment_time,
      reason: appointment.reason
    });
    setSelectedDate(new Date(appointment.appointment_time));
    setEditingId(appointment.id ?? null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/appointments/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Appointment deleted!');
          fetchAppointments();
        } else if (response.status === 401) {
          handleAuthError({ response });
        } else {
          toast.error('Failed to delete appointment');
        }
      } catch (error: any) {
        handleAuthError(error);
      }
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <button 
          className="new-appointment-btn"
          onClick={() => {
            setIsFormOpen(true);
            setEditingId(null);
            setFormData({
              doctor_name: '',
              appointment_time: '',
              reason: ''
            });
          }}
        >
          New Appointment
        </button>
      </div>

      {isFormOpen && (
        <div className="appointment-form-container">
          <form onSubmit={handleSubmit} className="appointment-form">
            <h2>{editingId ? 'Edit Appointment' : 'New Appointment'}</h2>
            
            <div className="form-group">
              <label>Doctor Name:</label>
              <input
                type="text"
                value={formData.doctor_name}
                onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                required
                placeholder="Enter doctor's name"
              />
            </div>

            <div className="form-group">
              <label>Appointment Date & Time:</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="date-picker"
                required
              />
            </div>

            <div className="form-group">
              <label>Reason:</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                placeholder="Enter reason for appointment"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingId ? 'Update' : 'Create'} Appointment
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <p className="no-appointments">No appointments scheduled</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-info">
                <h3>{appointment.doctor_name}</h3>
                <p className="appointment-time">
                  {new Date(appointment.appointment_time).toLocaleString()}
                </p>
                <p className="appointment-reason">{appointment.reason}</p>
              </div>
              <div className="appointment-actions">
                <button 
                  onClick={() => handleEdit(appointment)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => appointment.id && handleDelete(appointment.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments; 