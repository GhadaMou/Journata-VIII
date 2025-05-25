import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { toast } from 'react-toastify';
import ServiceRequestForm from './ServiceRequestForm';

function ServiceRequestsSection() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [availableWorkers, setAvailableWorkers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchRequests();
        if (userRole !== 'worker') {
            fetchAvailableWorkers();
        }
    }, [userRole]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchCurrentUser();
    }, []);

    const fetchAvailableWorkers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('user_id, name, job')
                .eq('role', 'worker');

            if (error) throw error;
            setAvailableWorkers(data || []);
        } catch (error) {
            console.error('Error fetching workers:', error);
            toast.error('Failed to fetch available workers');
        }
    };

    const fetchRequests = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                toast.error('You must be logged in to view service requests');
                return;
            }

            console.log('Current user ID:', user.id);

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            console.log('User profile:', profile);

            if (profileError) {
                console.error('Profile error:', profileError);
                throw profileError;
            }

            setUserRole(profile.role);

            let query = supabase
                .from('service_requests')
                .select(`
                    *,
                    client:client_id (
                        name,
                        email
                    ),
                    worker:worker_id (
                        name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (profile.role === 'worker') {
                console.log('Fetching requests for worker');
                query = query.eq('worker_id', user.id);
            } else {
                console.log('Fetching requests for client');
                query = query.eq('client_id', user.id);
            }

            const { data, error } = await query;

            console.log('Fetched requests:', data);
            console.log('Query error if any:', error);

            if (error) throw error;

            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching service requests:', error);
            toast.error('Failed to fetch service requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            if (!currentUser) {
                toast.error('You must be logged in to update request status');
                return;
            }

            const { error } = await supabase
                .from('service_requests')
                .update({ status: newStatus })
                .eq('id', requestId);

            if (error) throw error;

            // If the request is accepted, send a notification message to the client
            if (newStatus === 'accepted') {
                // Get the request details to find the client
                const { data: requestData, error: requestError } = await supabase
                    .from('service_requests')
                    .select('client_id, type')
                    .eq('id', requestId)
                    .single();

                if (requestError) throw requestError;

                // Send notification message to the client
                const { error: messageError } = await supabase
                    .from('messages')
                    .insert([
                        {
                            sender_id: currentUser.id,
                            receiver_id: requestData.client_id,
                            content: `Your ${requestData.type} service request has been accepted! You can now send a message to start the conversation.`,
                        }
                    ]);

                if (messageError) throw messageError;
            }

            toast.success(`Request ${newStatus} successfully`);
            fetchRequests();
        } catch (error) {
            console.error('Error updating request status:', error);
            toast.error('Failed to update request status');
        }
    };

    const handleNewRequest = () => {
        if (availableWorkers.length === 0) {
            toast.error('No workers available');
            return;
        }
        setShowRequestForm(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col gap-6 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Service Requests</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {userRole === 'worker' ? 'Requests assigned to you' : 'Your service requests'}
                        </p>
                    </div>
                    {userRole !== 'worker' && (
                        <div className="flex flex-col gap-4">
                            <select
                                value={selectedWorkerId || ''}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
                            >
                                <option value="">Select a worker</option>
                                {availableWorkers.map((worker) => (
                                    <option key={worker.user_id} value={worker.user_id}>
                                        {worker.name} - {worker.job}
                                    </option>
                                ))}
                            </select>
                            <ServiceRequestForm
                                workerId={selectedWorkerId}
                                onClose={() => {
                                    // After submit, just clear the worker selection
                                    setSelectedWorkerId(null);
                                    fetchRequests();
                                }}
                            />
                        </div>
                    )}
                </div>

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
                                            {userRole === 'worker' ? (
                                                <>From: {request.client?.name || 'Unknown'}</>
                                            ) : (
                                                <>To: {request.worker?.name || 'Unknown'}</>
                                            )}
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

                                {request.status === 'pending' && userRole === 'worker' && (
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
        </div>
    );
}

export default ServiceRequestsSection; 