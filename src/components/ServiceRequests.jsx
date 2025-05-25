import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function ServiceRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserRole();
    }, []);

    const checkUserRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                toast.error('You must be logged in to view service requests');
                navigate('/');
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (profile.role !== 'worker') {
                toast.error('Only workers can access service requests');
                navigate('/');
                return;
            }

            fetchRequests();
        } catch (error) {
            console.error('Error checking user role:', error);
            toast.error('Failed to verify user role');
            navigate('/');
        }
    };

    const fetchRequests = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                toast.error('You must be logged in to view service requests');
                return;
            }

            console.log('Current user:', user.id); // Debug log

            const { data, error } = await supabase
                .from('service_requests')
                .select(`
                    *,
                    client:client_id (
                        name,
                        email
                    )
                `)
                .eq('worker_id', user.id)
                .order('created_at', { ascending: false });

            console.log('Fetched requests:', data); // Debug log
            console.log('Error if any:', error); // Debug log

            if (error) throw error;

            setRequests(data);
        } catch (error) {
            console.error('Error fetching service requests:', error);
            toast.error('Failed to fetch service requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            const { error } = await supabase
                .from('service_requests')
                .update({ status: newStatus })
                .eq('id', requestId);

            if (error) throw error;

            toast.success(`Request ${newStatus} successfully`);
            fetchRequests(); // Refresh the list
        } catch (error) {
            console.error('Error updating request status:', error);
            toast.error('Failed to update request status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Service Requests</h2>
            
            {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No service requests found</p>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold capitalize">{request.type}</h3>
                                    <p className="text-sm text-gray-600">
                                        From: {request.client?.name || 'Unknown'} ({request.client?.email})
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <p className="text-gray-700"><strong>Description:</strong> {request.description}</p>
                                <p className="text-gray-700"><strong>Requested Date:</strong> {new Date(request.requested_date).toLocaleDateString()}</p>
                                <p className="text-gray-700"><strong>Address:</strong> {request.address}</p>
                            </div>

                            {request.status === 'pending' && (
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => handleStatusUpdate(request.id, 'declined')}
                                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                                    >
                                        Accept
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ServiceRequests; 