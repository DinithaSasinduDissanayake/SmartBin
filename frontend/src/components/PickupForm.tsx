import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/PickupForm.css';

const PickupForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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

    const [showMap, setShowMap] = useState(false);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Calculate amount when relevant form data changes
        calculateAmount();
    }, [formData.community, formData.address, formData.serviceType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Validate field on change
        validateField(name, value);
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            setFormData({
                ...formData,
                preferredDate: date.toISOString()
            });
            validateField('preferredDate', date);
        }
    };

    const validateField = (name: string, value: any) => {
        let newErrors = { ...errors };

        switch (name) {
            case 'name':
                if (!value) {
                    newErrors.name = 'Name is required';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'contactNumber':
                if (!value) {
                    newErrors.contactNumber = 'Contact number is required';
                } else if (!/^\d{10}$/.test(value)) {
                    newErrors.contactNumber = 'Contact number must be exactly 10 digits';
                } else {
                    delete newErrors.contactNumber;
                }
                break;
            case 'email':
                if (!value) {
                    newErrors.email = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.email = 'Valid email is required';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'community':
                if (!value) {
                    newErrors.community = 'Community is required';
                } else {
                    delete newErrors.community;
                }
                break;
            case 'address':
                if (!value) {
                    newErrors.address = 'Address is required';
                } else {
                    delete newErrors.address;
                }
                break;
            case 'preferredDate':
                if (!value) {
                    newErrors.preferredDate = 'Preferred date is required';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        newErrors.preferredDate = 'Preferred date must be a future date';
                    } else if (formData.serviceType === 'regular' && selectedDate.getTime() < today.getTime() + 2 * 24 * 60 * 60 * 1000) {
                        newErrors.preferredDate = 'For regular service, date must be at least 2 days from today';
                    } else if (formData.serviceType === 'urgent' && selectedDate.getTime() < today.getTime() + 24 * 60 * 60 * 1000) {
                        newErrors.preferredDate = 'For urgent service, date must be at least tomorrow';
                    } else {
                        delete newErrors.preferredDate;
                    }
                }
                break;
            case 'serviceType':
                if (!value) {
                    newErrors.serviceType = 'Service type is required';
                } else {
                    delete newErrors.serviceType;
                    
                    // Revalidate date if it was already selected
                    if (formData.preferredDate) {
                        validateField('preferredDate', formData.preferredDate);
                    }
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleMapClick = () => {
        setShowMap(true);
    };

    const MapClickHandler: React.FC = () => {
        useMapEvents({
            click: (e) => {
                setPosition([e.latlng.lat, e.latlng.lng]);
                setFormData({
                    ...formData,
                    location: `${e.latlng.lat},${e.latlng.lng}`
                });
            }
        });
        return null;
    };

    const calculateAmount = () => {
        let baseAmount = 0;
        
        // Base amount by community type
        if (formData.community === 'Household') {
            baseAmount = 500; // Base amount for households
        } else if (formData.community === 'Industry') {
            baseAmount = 1000; // Base amount for industries
        }
        
        // Additional amount for urgent service
        if (formData.serviceType === 'urgent') {
            baseAmount += 300; // Additional charge for urgent service
        }
        
        // Additional amount based on address (simplified example)
        // In a real app, you might want to calculate this based on distance or zones
        if (formData.address && formData.address.toLowerCase().includes('colombo')) {
            baseAmount += 200; // Additional charge for Colombo area
        }
        
        setFormData({
            ...formData,
            amount: baseAmount
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields before submission
        let isValid = true;
        for (const key in formData) {
            if (key === 'wasteType') {
                if (selectedWasteTypes.length === 0) {
                    setErrors(prev => ({...prev, wasteType: 'At least one waste type is required'}));
                    isValid = false;
                }
            } else if (key !== 'amount' && key !== 'location') { // Skip validation for calculated fields
                if (!validateField(key, formData[key as keyof typeof formData])) {
                    isValid = false;
                }
            }
        }
        
        // Check if location is set
        if (!formData.location) {
            setErrors(prev => ({...prev, location: 'Please select location on map'}));
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        try {
            setLoading(true);
            
            // Prepare data for submission
            const submitData = {
                ...formData,
                wasteType: selectedWasteTypes
            };
            
            // Send POST request to backend
            const response = await axios.post('http://localhost:5000/api/pickup', submitData);
            
            if (response.status === 201) {
                alert('Pickup request submitted successfully!');
                navigate('/my-bin-details'); // Navigate to bin details after successful submission
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                // Set validation errors from backend
                const backendErrors = error.response.data.errors.reduce((acc: any, curr: any) => {
                    return { ...acc, [curr.param || 'general']: curr.msg };
                }, {});
                setErrors(backendErrors);
            } else {
                setErrors({ general: 'Failed to submit request. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWasteTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        
        if (checked) {
            setSelectedWasteTypes([...selectedWasteTypes, value]);
        } else {
            setSelectedWasteTypes(selectedWasteTypes.filter(type => type !== value));
        }
        
        // Clear wasteType error if at least one is selected
        if (checked && errors.wasteType) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.wasteType;
                return newErrors;
            });
        }
    };

    const filterDate = (date: Date) => {
        const day = date.getDay();
        // Allow only weekdays (Monday to Friday)
        return day !== 0 && day !== 6;
    };

    const closeMap = () => {
        setShowMap(false);
    };

    return (
        <div className="page-container">
            <div className="main-content">
                <div className="form-section">
                    <h1 className="form-title">Request Pickup</h1>
                    <div className="form-container">
                        <div className="form-box">
                            <div className="form-fields">
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && <p className="error">{errors.name}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="contactNumber">Contact Number</label>
                                        <input
                                            type="text"
                                            id="contactNumber"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            placeholder="Enter 10-digit number"
                                        />
                                        {errors.contactNumber && <p className="error">{errors.contactNumber}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && <p className="error">{errors.email}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="community">Community Type</label>
                                        <select
                                            id="community"
                                            name="community"
                                            value={formData.community}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select community type</option>
                                            <option value="Household">Household</option>
                                            <option value="Industry">Industry</option>
                                        </select>
                                        {errors.community && <p className="error">{errors.community}</p>}
                                    </div>
                                    
                                    <div>
                                        <label>Waste Type</label>
                                        <div className="waste-type-checkboxes">
                                            <div className="waste-type-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="wasteType"
                                                        value="Organic"
                                                        onChange={handleWasteTypeChange}
                                                        checked={selectedWasteTypes.includes('Organic')}
                                                    />
                                                    Organic Waste
                                                </label>
                                            </div>
                                            <div className="waste-type-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="wasteType"
                                                        value="Plastic"
                                                        onChange={handleWasteTypeChange}
                                                        checked={selectedWasteTypes.includes('Plastic')}
                                                    />
                                                    Plastic Waste
                                                </label>
                                            </div>
                                            <div className="waste-type-option">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="wasteType"
                                                        value="Paper"
                                                        onChange={handleWasteTypeChange}
                                                        checked={selectedWasteTypes.includes('Paper')}
                                                    />
                                                    Paper Waste
                                                </label>
                                            </div>
                                        </div>
                                        {errors.wasteType && <p className="error">{errors.wasteType}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="address">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your address"
                                        />
                                        {errors.address && <p className="error">{errors.address}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="serviceType">Service Type</label>
                                        <select
                                            id="serviceType"
                                            name="serviceType"
                                            value={formData.serviceType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select service type</option>
                                            <option value="regular">Regular</option>
                                            <option value="urgent">Urgent (Additional fee)</option>
                                        </select>
                                        {errors.serviceType && <p className="error">{errors.serviceType}</p>}
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="preferredDate">Preferred Pickup Date</label>
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            minDate={new Date()}
                                            filterDate={filterDate}
                                            placeholderText="Select preferred date"
                                            className="datepicker"
                                        />
                                        {errors.preferredDate && <p className="error">{errors.preferredDate}</p>}
                                    </div>
                                    
                                    <div>
                                        <label>Location</label>
                                        <button type="button" onClick={handleMapClick}>
                                            Select Location on Map
                                        </button>
                                        {position && (
                                            <p>Selected: {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
                                        )}
                                        {errors.location && <p className="error">{errors.location}</p>}
                                    </div>
                                    
                                    <div>
                                        <label>Estimated Amount</label>
                                        <input
                                            type="text"
                                            value={`Rs. ${formData.amount.toFixed(2)}`}
                                            readOnly
                                        />
                                    </div>
                                    
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {showMap && (
                <div className="map-modal">
                    <div className="map-modal-content">
                        <button className="close-map" onClick={closeMap}>X</button>
                        <h3>Select Your Location</h3>
                        <MapContainer 
                            center={[6.9271, 79.8612]} // Colombo, Sri Lanka coordinates
                            zoom={13} 
                            style={{ height: '400px', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler />
                            {position && <Marker position={position} />}
                        </MapContainer>
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <button onClick={closeMap}>Confirm Location</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupForm;