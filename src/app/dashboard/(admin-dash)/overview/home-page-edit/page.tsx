"use client";
import HomePageEditor from "@/components/dashboard/HomePageEditor";
import LoadingScreen from "@/components/ui/shared/LoadingScreen";
import { defaultState } from "@/lib/types/homePage";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(defaultState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/page`);
        if (response.status === 200) {
          setData(response.data.data);
          setLoading(false);
        } else {
          // Handle other status codes
        }
      } catch (error: unknown) {
        // Handle error
        console.log("error: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen></LoadingScreen>;
  }

  return <HomePageEditor initialData={data}></HomePageEditor>;
};

export default Page;
