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
import { IconType } from 'react-icons';
import { FaCalendarPlus, FaEdit, FaTrash, FaClock, FaHospital, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';

interface Appointment {
  id?: number;
  doctor_name: string;
  doctor_place_id?: string;
  appointment_time: string;
  reason: string;
  created_at?: string;
}

const IconWrapper = ({ Icon, ...props }: { Icon: IconType; [key: string]: any }) => {
  const IconComponent = Icon as React.ComponentType<any>;
  return <IconComponent {...props} />;
};

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
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/appointments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.sort((a: Appointment, b: Appointment) => 
          new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()
        ));
      } else if (response.status === 401) {
        handleAuthError({ response });
      } else {
        toast.error('Failed to fetch appointments');
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.doctor_name.trim()) {
      toast.error('Please enter a doctor name');
      return;
    }
    if (!formData.reason.trim()) {
      toast.error('Please enter a reason for the appointment');
      return;
    }

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
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to save appointment');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <IconWrapper Icon={FaCalendarPlus} /> New Appointment
        </button>
      </div>

      {isFormOpen && (
        <div className="appointment-form-container">
          <form onSubmit={handleSubmit} className="appointment-form">
            <h2>{editingId ? 'Edit Appointment' : 'New Appointment'}</h2>
            
            <div className="form-group">
              <label><IconWrapper Icon={FaHospital} /> Doctor Name:</label>
              <input
                type="text"
                value={formData.doctor_name}
                onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                required
                placeholder="Enter doctor's name"
              />
            </div>

            <div className="form-group">
              <label><IconWrapper Icon={FaCalendarAlt} /> Appointment Date & Time:</label>
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
              <label><IconWrapper Icon={FaFileAlt} /> Reason:</label>
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
        {isLoading ? (
          <div className="no-appointments">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="no-appointments">
            <IconWrapper Icon={FaCalendarAlt} size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No appointments scheduled</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
              Click "New Appointment" to schedule one
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-info">
                <h3><IconWrapper Icon={FaHospital} /> {appointment.doctor_name}</h3>
                <p className="appointment-time">
                  <IconWrapper Icon={FaClock} /> {formatDate(appointment.appointment_time)}
                </p>
                <p className="appointment-reason">
                  <IconWrapper Icon={FaFileAlt} /> {appointment.reason}
                </p>
              </div>
              <div className="appointment-actions">
                <button 
                  onClick={() => handleEdit(appointment)}
                  className="edit-btn"
                >
                  <IconWrapper Icon={FaEdit} /> Edit
                </button>
                <button 
                  onClick={() => appointment.id && handleDelete(appointment.id)}
                  className="delete-btn"
                >
                  <IconWrapper Icon={FaTrash} /> Delete
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