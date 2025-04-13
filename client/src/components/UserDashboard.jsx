import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket/Socket";
import { useAuth } from '../context/AuthContext';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from "./Navbar";

const stateCityData = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  TamilNadu: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Delhi: ["New Delhi", "Noida", "Gurgaon", "Faridabad"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
};

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const userId = "user_id_from_context";
  const [fromState, setFromState] = useState(""); 
  const [fromCity, setFromCity] = useState(""); 
  const [toState, setToState] = useState(""); 
  const [toCity, setToCity] = useState(""); 
  const [seats, setSeats] = useState("");
  const { notification } = useAuth();
  const [pickupTime, setPickupTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // Handle creating a pool
  const handleCreatePool = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/pools/create",
        { from: fromCity, to: toCity, seatsAvailable: 4, pickupLocation, pickupTime },
        { withCredentials: true }
      );

      socket.emit("newPoolRequest", res.data);

      alert("Pool Created Successfully");
      fetchBookings(); // To update the bookings after pool creation
    } catch (err) {
      console.error(err);
      alert("Error creating pool");
    }
  };

  const fetchBookings = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/pools/user/bookings",
      { withCredentials: true }
    );
    setBookings(res.data);
  };

  useEffect(() => {
    fetchBookings();

    socket.on("poolConfirmed", (updatedPool) => {
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === updatedPool._id ? updatedPool : booking
        )
      );
    });

    return () => socket.off("poolConfirmed");
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const images = [
    "https://www.shutterstock.com/image-photo/black-modern-car-closeup-on-600nw-2139196215.jpg",
    "https://www.shutterstock.com/image-photo/view-young-woman-traveler-looking-600nw-1357730831.jpg",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        {notification && (
          <div className="fixed top-4 right-4 bg-green-400 text-white p-3 rounded-md shadow-lg">
            {notification}
          </div>
        )}

        {/* Image Slider */}
        <Slider {...sliderSettings} className="w-full h-64 mb-10">
          {images.map((img, index) => (
            <div key={index} className="w-full h-64">
              <img
                src={img}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
        </Slider>

        <div className="container mx-auto p-6">
          <h2 className="text-4xl font-bold text-teal-900 mb-8">User Dashboard</h2>

          {/* Create Pool Section */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-10">
            <h3 className="text-2xl font-semibold mb-6">Create a Pool</h3>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">From</h4>
              <select
                className="p-3 mb-4 border w-full rounded-lg"
                value={fromState}
                onChange={(e) => {
                  setFromState(e.target.value);
                  setFromCity(""); 
                }}
              >
                <option value="">Select State</option>
                {Object.keys(stateCityData).map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </select>

              <select
                className="p-3 mb-4 border w-full rounded-lg"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                disabled={!fromState} 
              >
                <option value="">Select City</option>
                {fromState &&
                  stateCityData[fromState].map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
              </select>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">To</h4>
              <select
                className="p-3 mb-4 border w-full rounded-lg"
                value={toState}
                onChange={(e) => {
                  setToState(e.target.value);
                  setToCity(""); 
                }}
              >
                <option value="">Select State</option>
                {Object.keys(stateCityData).map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </select>

            
              <select
                className="p-3 mb-4 border w-full rounded-lg"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                disabled={!toState} 
              >
                <option value="">Select City</option>
                {toState &&
                  stateCityData[toState].map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
              </select>
            </div>

            <input
              className="p-3 mb-4 border w-full rounded-lg"
              placeholder="PickUp Location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />

            <input
              type="time"
              className="p-3 mb-6 border w-full rounded-lg"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              min="09:00"
              max="18:00"
            />

            <button
              className="bg-teal-900 text-white w-full p-3 rounded-lg hover:bg-teal-700 transition-all"
              onClick={handleCreatePool}
            >
              Create Pool
            </button>
          </div>

          {/* My Bookings Section */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-6">My Bookings</h3>
            <ul className="space-y-4">
              {bookings.map((booking) => (
                <li
                  key={booking._id}
                  className={`p-4 rounded-lg shadow-sm ${
                    booking.status === "Confirmed"
                      ? "bg-green-100 border-l-4 border-green-500"
                      : "bg-yellow-100 border-l-4 border-yellow-500"
                  }`}
                >
                  <p className="text-lg font-semibold">
                    {booking.from} ➜ {booking.to}
                  </p>
                  <p className="text-sm text-gray-600">Status: {booking.status}</p>
                  <p className="text-sm text-gray-600">Seats Available: {booking.seatsAvailable}</p>
                  <p className="text-sm text-gray-600">Pickup Time: {booking.pickupTime}</p>
                  <p className="text-sm text-gray-600">Pickup Location: {booking.pickupLocation}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;