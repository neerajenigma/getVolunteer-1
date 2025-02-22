import React from "react";
import "./viewjob.css";
import LocationOnTwoToneIcon from "@mui/icons-material/LocationOnTwoTone";
import CalendarMonthTwoToneIcon from "@mui/icons-material/CalendarMonthTwoTone";
import CalendarTodayTwoToneIcon from "@mui/icons-material/CalendarTodayTwoTone";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { useEffect } from "react";
import { useState } from "react";
import { isoToDate } from "../funtions/Function";
import { useParams } from "react-router-dom";

import { StudentList } from "./StudentList";
import { useAuthStateValue } from "../context/AuthStateProvider";

const ViewJob = ({ }) => {
  const htmlelem = "<h1>hi<h1>";
  const [{ user }, authdispatch] = useAuthStateValue();
  const [jobDetails, setJobDetails] = useState(null);
  const [facultyDetails, setFacultyDetails] = useState(null);
  // const [applied, setApplied] = useState(false);
  const [application, setApplication] = useState(null);
  const { jobid } = useParams();
  useEffect(() => {
    fetchJobWithId();
    checkApplied();
  }, []);

  const fetchFacultyDetails = async (facultyId) => {
    const response = await fetch("http://localhost:8000/user/" + facultyId, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const responseData = await response.json();
    if (response.ok) {
      setFacultyDetails(responseData);
    }
  };
  const checkApplied = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/application/applied/" + jobid,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/jfson",
          },
          credentials: "include",
        }
      );
      const responseData=await response.json()
      if (response.ok) {
        console.log(responseData);
        if(responseData.success){
          setApplication(responseData.application)
        }
      } else {
        // console.log(errorData)
      }
    } catch (error) {
      // console.log(error)
    }
  };
  const onApply = async () => {
    try {
      const response = await fetch("http://localhost:8000/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobid,
        }),
        credentials: "include",
      });
      // console.log(response)
      if (response.ok) {
        const data = await response.json();
        checkApplied();
        fetchJobWithId();
      } else {
        const errorData = await response.json();
        window.alert(errorData.message);
      }
    } catch (error) {
      // console.log(error)
    }
  };

  const onWithdraw=async()=>{
    try {
      const response = await fetch("http://localhost:8000/application/"+application._id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "withdrawn"
        }),
        credentials: "include",
      });
      // console.log(response)
      const responseData = await response.json();
      if (response.ok) {
        console.log(responseData)
        checkApplied();
        fetchJobWithId();
      } else {
        // const errorData = await response.json();
        window.alert(responseData.message);
      }
    } catch (error) {
      console.log(error)
    }
  }


  const fetchJobWithId = async () => {
    try {
      const apiUrl = "http://localhost:8000/job/" + jobid; // Replace with your API URL
      // Use the fetch API with async/await
      const response = await fetch(apiUrl, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      setJobDetails(responseData);
      fetchFacultyDetails(responseData.facultyId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (jobDetails && facultyDetails &&
    <div className='viewjob'>
      <div className='viewjob__items'>
        <div className='viewjobcard'>
          <div className='view_jobimgadj'>
            <div>
              <p className='viewjobcard__heading'>
                {jobDetails.heading}
              </p>
              <p className='viewjob__person'>{facultyDetails.name}</p>
              <div className='viewjob__date'>
                <CalendarMonthTwoToneIcon />
                <p style={{ paddingRight: '90px' }}>Job Start date: {isoToDate(jobDetails.startingDate)}</p><pre />
                <CalendarTodayTwoToneIcon />
                <p >Job End date: {isoToDate(jobDetails.endingDate)}</p>
              </div>
              <div className='viewjob__date'>
                <DateRangeIcon />
                <p style={{ paddingRight: '30px' }}>Registration Start date: {isoToDate(jobDetails.registrationStartingDate)}</p>
                <CalendarTodayTwoToneIcon />
                <p>Registration End date: {isoToDate(jobDetails.registrationEndingDate)}</p>
              </div>
              <div className='viewjob_loc'>
                <LocationOnTwoToneIcon /> <p>{jobDetails.location}</p>
              </div>
            </div>
            <img alt='job logo' src='https://img.naukimg.com/logo_images/groups/v1/6015371.gif' />
          </div>
          <hr />
          <div className='viewjob__details'>
            <p style={{ paddingRight: "10px" }}><span style={{ color: "rgb(101, 99, 99)" }}>Posted on:</span> {isoToDate(jobDetails.postDate)} </p>
            <p style={{ paddingRight: "10px" }}><span style={{ color: "rgb(101, 99, 99)" }}>Openings:</span> 10</p>
            <p style={{ paddingRight: "10px" }}><span style={{ color: "rgb(101, 99, 99)" }}>Applicants:</span> {jobDetails.applicant}</p>
            {user.userType === "student" && !application && <button className="viewjob__button" onClick={()=>onApply()}>Apply Now</button>}
            {user.userType === "student" && application && application.status!=="withdrawn" && <button className="viewjobwithdraw__button" onClick={()=>onWithdraw()}>Withdraw</button>}
            {user.userType === "student" && application && application.status==="withdrawn" && <button className="dis" onClick={null}>Withdraw</button>}
          </div>
        </div>
        <div className='viewjobcard_desc'>
          <div dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
        </div>
      </div>
      {user.userType==="faculty" && <div>
        <StudentList jobId={jobid} />
      </div>}
    </div>

  )
    ;
};

export default ViewJob;
