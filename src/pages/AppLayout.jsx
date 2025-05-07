import Header from "../components/Header";
import FilterSection from "../components/Filter";
import ScrollableResults from "../components/ScrollableResults";
import { useData } from "../contexts/MyContext";
import WorkerDetailsPanel from "../components/WorkerDetailsPanel";
import WorkerReviews from "../components/WorkerReviews";
import { useState, useEffect } from "react";

function AppLayout() {
    const { selected } = useData();
    const [workerId, setWorkerId] = useState(null);

    // Update workerId when selected changes
    useEffect(() => {
        if (selected?.user_id) {
            setWorkerId(selected.user_id);
        }
    }, [selected]);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Main content area */}
            <main className="flex-1 pt-[55px] bg-gray-100">
                <div className="flex h-[calc(100vh-55px)] gap-4 px-4">
                    {/* Filter Section */}
                    <div className="w-[260px] min-w-[220px] h-full flex flex-col">
                        <FilterSection className="h-full flex-1" />
                    </div>

                    {/* Scrollable Results Section */}
                    <div className="w-[400px] min-w-[320px] h-full overflow-y-auto">
                        <ScrollableResults className="h-full w-full" />
                    </div>

                    {/* Worker Details and Reviews Panel */}
                    <div className="flex-1 min-w-[350px] flex flex-col gap-4 h-full min-h-0">
                        <div className="flex-[2] min-h-0 h-0">
                            <WorkerDetailsPanel worker={selected} workerId={workerId} />
                        </div>
                        <div className="flex-[1] min-h-0 h-0 flex flex-col">
                            <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
                                <h5 className="text-lg font-medium text-gray-700 mb-2">Reviews</h5>
                                {workerId ? (
                                    <WorkerReviews workerId={workerId} />
                                ) : (
                                    <p className="text-gray-500">Select a worker to see reviews.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AppLayout;
