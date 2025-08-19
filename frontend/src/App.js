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
        </Routes>
      </React.Fragment>
    </div>
  );  
}

export default App;
