import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/PickupForm.css';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PickupForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: '',
        community: '',
        wasteType: [] as string[],
        address: '',
        preferredDate: '',
        serviceType: '',
        location: '',
        amount: 0,
    });

    const [showMap, setShowMap] = useState(false);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const calculateAmount = () => {
            let basePrice = 0;
            if (formData.community === 'Household') {
                basePrice = 200;
            } else if (formData.community === 'Industry') {
                basePrice = 300;
            }

            let locationPrice = 0;
            if (formData.address.toLowerCase().includes('colombo')) {
                locationPrice = 200;
            } else if (formData.address.toLowerCase().includes('magama')) {
                locationPrice = 300;
            } else if (formData.address.toLowerCase().includes('kalutara')) {
                locationPrice = 400;
            }

            const distanceFactor = formData.address.length > 20 ? 1.5 : 1;
            const serviceFactor = formData.serviceType === 'urgent' ? 1.2 : 1;
            const calculatedAmount = (basePrice + locationPrice) * distanceFactor * serviceFactor;

            setFormData((prevData) => ({
                ...prevData,
                amount: calculatedAmount,
            }));
        };

        if (formData.community && formData.address && formData.serviceType) {
            calculateAmount();
        }
    }, [formData.community, formData.address, formData.serviceType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

        if (name === 'wasteType') {
            let newSelectedWasteTypes = [...selectedWasteTypes];
            if (checked) {
                newSelectedWasteTypes.push(value);
            } else {
                newSelectedWasteTypes = newSelectedWasteTypes.filter(type => type !== value);
            }
            setSelectedWasteTypes(newSelectedWasteTypes);
            setFormData({ ...formData, wasteType: newSelectedWasteTypes });
            validateField('wasteType', newSelectedWasteTypes);
        } else {
            setFormData({ ...formData, [name]: value });
            validateField(name, value);
        }
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        const dateString = date ? date.toISOString().split('T')[0] : '';
        setFormData((prevData) => ({
            ...prevData,
            preferredDate: dateString,
        }));
        validateField('preferredDate', dateString);
    };

    const validateField = (name: string, value: any) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'name':
                if (!value) newErrors[name] = 'Name is required';
                else delete newErrors[name];
                break;
            case 'contactNumber':
                if (!value) newErrors[name] = 'Contact number is required';
                else if (!/^\d{10}$/.test(value)) newErrors[name] = 'Contact number must be exactly 10 digits';
                else delete newErrors[name];
                break;
            case 'email':
                if (!value) newErrors[name] = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(value)) newErrors[name] = 'Valid email is required';
                else delete newErrors[name];
                break;
            case 'community':
                if (!value) newErrors[name] = 'Community is required';
                else if (!['Household', 'Industry'].includes(value)) newErrors[name] = 'Community must be either Household or Industry';
                else delete newErrors[name];
                break;
            case 'wasteType':
                const wasteTypes = value as string[];
                if (!wasteTypes || wasteTypes.length === 0) {
                    newErrors[name] = 'At least one waste type is required';
                } else {
                    const validWasteTypes = ['Organic', 'Plastic', 'Paper'];
                    if (!wasteTypes.every(type => validWasteTypes.includes(type))) {
                        newErrors[name] = 'Invalid waste type';
                    } else {
                        delete newErrors[name];
                    }
                }
                break;
            case 'address':
                if (!value) newErrors[name] = 'Address is required';
                else delete newErrors[name];
                break;
            case 'preferredDate':
                if (!value) {
                    newErrors[name] = 'Preferred date is required';
                } else {
                    const selected = new Date(value);
                    selected.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);
                    const dayAfterTomorrow = new Date(today);
                    dayAfterTomorrow.setDate(today.getDate() + 2);

                    if (isNaN(selected.getTime())) {
                        newErrors[name] = 'Preferred date must be a valid date';
                    } else if (selected < today) {
                        newErrors[name] = 'Preferred date must be a future date';
                    } else if (formData.serviceType === 'regular' && selected < dayAfterTomorrow) {
                        newErrors[name] = 'For regular service, date must be from the day after tomorrow onwards';
                    } else if (formData.serviceType === 'urgent' && selected < tomorrow) {
                        newErrors[name] = 'For urgent service, date must be from tomorrow onwards';
                    } else {
                        delete newErrors[name];
                    }
                }
                break;
            case 'serviceType':
                if (!value) newErrors[name] = 'Service type is required';
                else if (!['urgent', 'regular'].includes(value)) newErrors[name] = 'Service type must be either urgent or regular';
                else {
                    delete newErrors[name];
                    if (formData.preferredDate) {
                        validateField('preferredDate', formData.preferredDate);
                    }
                }
                break;
            case 'location':
                if (!value) newErrors[name] = 'Location is required';
                else delete newErrors[name];
                break;
        }

        setErrors(newErrors);
    };

    const handleMapClick = () => {
        setShowMap(true);
    };

    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                const locationValue = `Lat: ${e.latlng.lat}, Lng: ${e.latlng.lng}`;
                setFormData((prevData) => ({
                    ...prevData,
                    location: locationValue,
                }));
                validateField('location', locationValue);
                setShowMap(false);
            },
        });
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const fieldsToValidate = [
            'name',
            'contactNumber',
            'email',
            'community',
            'wasteType',
            'address',
            'preferredDate',
            'serviceType',
            'location',
        ];
    
        let hasErrors = false;
        const newErrors: { [key: string]: string } = {};
    
        fieldsToValidate.forEach((field) => {
            const value = field === 'wasteType' ? formData.wasteType : formData[field as keyof typeof formData];
            validateField(field, value);
            if (errors[field] || !value || (field === 'wasteType' && (value as string[]).length === 0)) {
                hasErrors = true;
                if (!value || (field === 'wasteType' && (value as string[]).length === 0)) {
                    newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                }
            }
        });
    
        setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    
        if (hasErrors || Object.keys(errors).length > 0) {
            alert('Please fill all fields correctly before submitting.');
            return;
        }
    
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/pickup', formData);
            alert(response.data.message || 'Pickup request submitted successfully!');
            setFormData({
                name: '',
                contactNumber: '',
                email: '',
                community: '',
                wasteType: [],
                address: '',
                preferredDate: '',
                serviceType: '',
                location: '',
                amount: 0,
            });
            setSelectedWasteTypes([]);
            setSelectedDate(null);
            setPosition(null);
            setErrors({});
            navigate('/my-bin-details'); 
        } catch (error: any) {
            if (error.response && error.response.data.errors) {
                const errorMessages = error.response.data.errors.map((err: any) => err.msg).join('\n');
                alert('Validation Errors:\n' + errorMessages);
            } else if (error.request) {
                alert('Error submitting request: No response from server. Please check if the backend is running.');
            } else {
                console.error(error);
                alert('Error submitting request: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const filterDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        if (formData.serviceType === 'regular') {
            return date >= dayAfterTomorrow;
        } else if (formData.serviceType === 'urgent') {
            return date >= tomorrow;
        }
        return date >= today;
    };

    const closeMap = () => {
        setShowMap(false);
        setPosition(null);
    };

    return (
        <div className="page-container">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="form-section">
                    <h2 className="form-title">Fill Out The Details Below To Dispose Off Your Waste!</h2>
                    <div className="form-container">
                        <div className="form-box">
                            <div className="form-image"></div>
                            <div className="form-fields">
                                <form onSubmit={handleSubmit}>
                                    <label htmlFor="name">Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
                                    {errors.name && <span className="error">{errors.name}</span>}

                                    <label htmlFor="contactNumber">Contact Number</label>
                                    <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                                    {errors.contactNumber && <span className="error">{errors.contactNumber}</span>}

                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                                    {errors.email && <span className="error">{errors.email}</span>}

                                    <label htmlFor="community">Community</label>
                                    <select id="community" name="community" value={formData.community} onChange={handleChange}>
                                        <option value="">Select Community</option>
                                        <option value="Household">Household</option>
                                        <option value="Industry">Industry</option>
                                    </select>
                                    {errors.community && <span className="error">{errors.community}</span>}

                                    <label>Waste Type</label>
                                    <div className="waste-type-checkboxes">
                                        {['Organic', 'Plastic', 'Paper'].map(type => (
                                            <div key={type} className="waste-type-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="wasteType"
                                                        value={type}
                                                        checked={selectedWasteTypes.includes(type)}
                                                        onChange={handleChange}
                                                    />
                                                    {type}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.wasteType && <span className="error">{errors.wasteType}</span>}

                                    <label htmlFor="serviceType">Service Type</label>
                                    <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange}>
                                        <option value="">Select Service Type</option>
                                        <option value="regular">Regular</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    {errors.serviceType && <span className="error">{errors.serviceType}</span>}

                                    <label htmlFor="preferredDate">Preferred Date</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={handleDateChange}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select a date"
                                        filterDate={filterDate}
                                    />
                                    {errors.preferredDate && <span className="error">{errors.preferredDate}</span>}

                                    <label htmlFor="address">Address</label>
                                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
                                    {errors.address && <span className="error">{errors.address}</span>}

                                    <label htmlFor="location">Location</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        readOnly
                                    />
                                    <button type="button" onClick={handleMapClick}>
                                        <i className="fas fa-map-marker-alt"></i> Select Location On Map
                                    </button>
                                    {errors.location && <span className="error">{errors.location}</span>}

                                    <label htmlFor="amount">Amount</label>
                                    <input
                                        type="text"
                                        id="amount"
                                        name="amount"
                                        value={formData.amount}
                                        readOnly
                                    />

                                    <button type="submit" disabled={loading}>
                                        {loading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {showMap && (
                <div className="map-modal">
                    <div className="map-modal-content">
                        <button className="close-map" onClick={closeMap}>Close</button>
                        <MapContainer center={[6.9271, 79.8612]} zoom={13} style={{ height: '400px', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {position && <Marker position={position} />}
                            <MapClickHandler />
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupForm;