import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function App() {
  // const handleGoogleLoginSuccess = async (credentialResponse) => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:9080/api/v1/auth/google-signin",
  //       {
  //         token: credentialResponse.credential,
  //       }
  //     );

  //     if (response.data.success) {
  //       console.log("Login Successful:", response.data);
  //       localStorage.setItem("token", response.data.token);
  //       alert("Welcome " + response.data.user.name);
  //     } else {
  //       console.error("Error in Google Sign-In:", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error during Google Sign-In:", error);
  //   }
  // };

  // const handleGoogleLoginFailure = () => {
  //   console.error("Google Sign-In Failed");
  // };
  // console.log("Current Origin:", window.location.origin);

  const token = localStorage.getItem("token");
  // const handlejob = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.post(
  //       "http://localhost:9080/api/v1/goal/add",
  //       {
  //         name: "kinderJoy",
  //         description: "kinderJoy kinne",
  //         targetAmount: 80,
  //         monthlyContribution: 20,
  //         deadline: "2025-1-10",
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("Job added:", response.data);
  //   } catch (error) {
  //     console.error("Error adding job:", error.response?.data || error.message);
  //   }
  // };

  // const handleSignIn = async (e) => {
  //   e.preventDefault();

  //   axios
  //     .post("http://localhost:9080/api/v1/auth/register", {
  //       name: "test1",
  //       email: "test1@test.com",
  //       password: "1234",
  //     })
  //     .then((response) => {
  //       const { success, message } = response.data;
  //       console.log(message);
  //       if (success) {
  //         localStorage.setItem("token", response.data.token);
  //       } else {
  //         console.log(message);
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // };
  return (
    <GoogleOAuthProvider clientId="1011948815463-0lpjitaop2834ndhcfkgm4dmf573k5um.apps.googleusercontent.com">
      <div>
        {/* <div className="auth">
          <h2>Sign In </h2>
          <button onClick={handleSignIn}>sign in</button>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
          />
        </div> */}
        {/* <button onClick={handlejob}>add job</button> */}
        {token && <div>lol</div>}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
