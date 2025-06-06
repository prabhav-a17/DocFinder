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
  notification_minutes_before: number;
}

const NOTIFICATION_OPTIONS = [
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: 'Custom', value: 'custom' }
];

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
    reason: '',
    notification_minutes_before: 60
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [notificationTime, setNotificationTime] = useState<number | 'custom'>(60);
  const [customNotification, setCustomNotification] = useState<number>(60);

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
    const minutesBefore = notificationTime === 'custom' ? customNotification : notificationTime;
    const appointmentData = {
      ...formData,
      appointment_time: selectedDate.toISOString(),
      notification_minutes_before: minutesBefore
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
        const savedAppointment = await response.json();
        toast.success(editingId ? 'Appointment updated!' : 'Appointment created!');
        setIsFormOpen(false);
        setFormData({
          doctor_name: '',
          appointment_time: '',
          reason: '',
          notification_minutes_before: 60
        });
        setNotificationTime(60);
        setCustomNotification(60);
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
      reason: appointment.reason,
      notification_minutes_before: appointment.notification_minutes_before || 60
    });
    setSelectedDate(new Date(appointment.appointment_time));
    setNotificationTime(appointment.notification_minutes_before ? 
      NOTIFICATION_OPTIONS.find(opt => opt.value === appointment.notification_minutes_before) ? 
      appointment.notification_minutes_before : 'custom' 
      : 60
    );
    setCustomNotification(appointment.notification_minutes_before || 60);
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
              reason: '',
              notification_minutes_before: 60
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

            <div className="form-group">
              <label htmlFor="notification-time">Notification Time:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  id="notification-time"
                  className="form-control"
                  value={notificationTime}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'custom') setNotificationTime('custom');
                    else setNotificationTime(Number(val));
                  }}
                  style={{ flex: '0 0 200px', padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '1rem' }}
                  required
                >
                  {NOTIFICATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {notificationTime === 'custom' && (
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={customNotification}
                    onChange={e => setCustomNotification(Number(e.target.value))}
                    className="form-control"
                    style={{ width: 90, padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '1rem' }}
                    placeholder="Minutes"
                    required
                  />
                )}
                <span style={{ color: '#6B7280', fontSize: '0.95rem', marginLeft: 4 }}>
                  before appointment
                </span>
              </div>
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
                <p className="appointment-notification">
                  Reminder: {appointment.notification_minutes_before} minutes before
                </p>
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