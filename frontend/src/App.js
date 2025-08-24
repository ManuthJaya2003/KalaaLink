// import './App.css';
import Home from './Components/Home/Home.js';
import ArtistManagerDashboard from './Components/Manuth/ArtistManagerDashboard/ArtistManagerDashboard.js';
import React from 'react';
import { Route,Routes } from 'react-router-dom';
import ManageArtists from './Components/Manuth/ManageArtists/ManageArtists.js';
import AddArtist from './Components/Manuth/AddArtist/AddArtist.js';
import Artists from './Components/Artists/Artists.js';
import UpdateArtist from './Components/Manuth/UpdateArtist/UpdateArtist.js';
import Applications from './Components/Manuth/Applications/Applications.js';
import SignUp from './Components/SignUp/SignUp.js'
import Overview from './Components/Manuth/Overview/Overview.js'
import ArtistRegistration from './Components/Manuth/ArtistRegistration/ArtistRegistration.js';
import Login from './Components/Login/Login.js';
import ProfessionalLogin from './Components/Manuth/ProfessionalLogin/ProfessionalLogin.js';
import AdminDashboard from './Components/Thaveesha/AdminDashboard/AdminDashboard.js';
import EventManagerDashboard from './Components/Lihini/EventManagerDashboard/EventManagerDashboard.js';
import ArtistLogin from './Components/Manuth/ArtistLogin/ArtistLogin.js';
import ArtistPortfolio from './Components/Manuth/ArtistPortfolio/ArtistPortfolio.js';
import ArtistDashboard from './Components/Manuth/ArtistDashboard/ArtistDashboard.js';
import ArtistEditProfile from './Components/Manuth/ArtistEditProfile/ArtistEditProfile.js';

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element = {<Home/>}/>
          <Route path="/mainhome" element = {<Home/>}/>
          <Route path="/artists" element = {<Artists/>}/>
          <Route path="/artistManager" element = {<ArtistManagerDashboard/>}/>
          <Route path="/manage_artists" element = {<ManageArtists/>}/>
          <Route path="/manage_artists/:artist_id" element={<UpdateArtist />} />
          <Route path="/addArtist" element = {<AddArtist/>}/>
          <Route path="/applications" element = {<Applications/>}/>
          <Route path="/signup" element = {<SignUp/>}/>
          <Route path="/overview" element = {<Overview/>}/>
          <Route path="/register" element = {<ArtistRegistration/>}/>
          <Route path="/login" element = {<Login/>}/>
          <Route path="/professional_login" element = {<ProfessionalLogin/>}/>
          <Route path="/admindashboard" element = {<AdminDashboard/>}/>
          <Route path="/eventmanagerdashboard" element={<EventManagerDashboard/>}/>
          <Route path="/artist_login" element={<ArtistLogin/>}/>
          <Route path="/portfolio" element={<ArtistPortfolio/>} />
          <Route path="/artistdashboard" element={<ArtistDashboard/>}/>
          <Route path="/artist/editprofile" element={<ArtistEditProfile/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );  
}

export default App;
