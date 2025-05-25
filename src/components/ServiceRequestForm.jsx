import { useState } from 'react';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';

function ServiceRequestForm({ workerId, onClose }) {
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        date: '',
        address: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                toast.error('You must be logged in to request a service');
                return;
            }

            if (!workerId) {
                toast.error('No worker selected');
                return;
            }

            console.log('Submitting request for worker:', workerId); // Debug log

            const { error } = await supabase
                .from('service_requests')
                .insert([
                    {
                        client_id: user.id,
                        worker_id: workerId,
                        type: formData.type,
                        description: formData.description,
                        requested_date: formData.date,
                        address: formData.address,
                        status: 'pending'
                    }
                ]);

            if (error) {
                console.error('Error submitting request:', error); // Debug log
                throw error;
            }

            toast.success('Service request sent successfully!');
            onClose();
        } catch (error) {
            console.error('Error submitting service request:', error);
            toast.error('Failed to submit service request');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Request Service</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service Type</label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter the type of service (e.g. Cleaning, Plumbing, etc.)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Describe your service needs..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter service location address"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ServiceRequestForm; 