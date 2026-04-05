import { useEffect, useState } from "react";

export const useDashboardData = (loader) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await loader();

                if (!ignore) {
                    setData(result);
                    setError("");
                }
            } catch (fetchError) {
                if (!ignore) {
                    setError(fetchError?.response?.data?.message || "Failed to load dashboard data.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            ignore = true;
        };
    }, [loader]);

    return { data, loading, error, setData, setError };
};
