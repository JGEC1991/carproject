import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null); // State for the selected profile photo
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setFullName(user?.user_metadata?.full_name || '');
      setPhone(user?.user_metadata?.phone || '');
    } catch (error) {
      console.error('Error fetching user:', error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        alert(error.message);
      } else {
        console.log('Logged out');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error.message);
      alert(error.message);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelClick = () => {
    setEditing(false);
    setFullName(user?.user_metadata?.full_name || '');
    setPhone(user?.user_metadata?.phone || '');
  };

  const handleSaveClick = async () => {
    try {
      let profilePhotoUrl = null;

      if (profilePhoto) {
        // Upload the profile photo to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(`${user.id}/profile_photo.png`, profilePhoto, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/png',
          });

        if (uploadError) {
          console.error('Error uploading profile photo:', uploadError);
          alert(uploadError.message);
          return;
        }

        // Get the public URL of the uploaded image
        profilePhotoUrl = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`${user.id}/profile_photo.png`).data.publicUrl;
      }

      // Update user metadata with the new profile photo URL and other details
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
          profile_photo: profilePhotoUrl, // Save the URL in user_metadata
        },
      });

      if (error) {
        console.error('Error updating profile:', error);
        alert(error.message);
      } else {
        console.log('Profile updated:', data);
        alert('Profile updated successfully!');
        fetchUser(); // Refresh user data
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert(error.message);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  return (
    <div className="page">
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <h1 className="text-3xl font-semibold mb-4">Profile</h1>

      {user && (
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div className="w-full md:w-1/3 bg-indigo-600 text-white p-4 flex flex-col items-center justify-center">
              <div className="relative">
                {editing ? (
                  <>
                    <label htmlFor="profilePhotoInput" className="cursor-pointer">
                      <div className="w-32 h-32 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                        {profilePhoto ? (
                          <img className="w-full h-full object-cover" src={URL.createObjectURL(profilePhoto)} alt="New Profile" />
                        ) : user.user_metadata?.profile_photo ? (
                          <img className="w-full h-full object-cover" src={user.user_metadata.profile_photo} alt="Profile" />
                        ) : (
                          <span>Upload Photo</span>
                        )}
                      </div>
                    </label>
                    <input
                      type="file"
                      id="profilePhotoInput"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </>
                ) : user.user_metadata?.profile_photo ? (
                  <img className="w-32 h-32 rounded-full object-cover" src={user.user_metadata.profile_photo} alt="Profile" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-indigo-200"></div>
                )}
              </div>
              <h2 className="text-xl font-semibold mt-4">{user.user_metadata?.full_name}</h2>
              <p className="text-gray-200">{user?.email}</p>
            </div>

            <div className="w-full md:w-2/3 p-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Account Details
              </h3>
              <div className="mb-2">
                <strong className="text-gray-700">ID:</strong> {user.id}
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Email:</strong> {user.email}
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Phone:</strong>
                {editing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                ) : (
                  user.user_metadata?.phone
                )}
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Drivers License Photo:</strong> {user.user_metadata?.drivers_license_photo}
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Police Records Photo:</strong> {user.user_metadata?.police_records_photo}
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Criminal Records Photo:</strong> {user.user_metadata?.criminal_records_photo}
              </div>
              <div className="mb-2">
                <strong className="text-gray-700">Role:</strong> {user.role}
              </div>

              <div className="mt-4">
                {editing ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
