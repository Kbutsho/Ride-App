import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from '../Firebase/firebaseConfig';
import { useContext, useState } from 'react';
import { UserContext } from "../../App";
import { useHistory, useLocation } from "react-router";
import './Login.css';


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const provider = new firebase.auth.GoogleAuthProvider();

function Login() {



    const [newUser, setNewUser] = useState(false);
    const [user, setUser] = useState({
        isSignIn: false,
        name: '',
        email: '',
        password: '',
        photo: '',
        error: '',
        success: false
    });
    const [loggedInUser, setLoggedInUser] = useContext(UserContext);
    // const [ setLoggedInUser] = useContext(UserContext);
    const history = useHistory();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };

    const handelGoogleSignIn = () => {
        firebase.auth().signInWithPopup(provider)
            .then(result => {
                const { displayName, photoURL, email } = result.user;
                const signInUser = {
                    isSignIn: true,
                    name: displayName,
                    email: email,
                    photo: photoURL
                }
                setUser(signInUser);
                setLoggedInUser(signInUser);
                history.replace(from);
            })
            .catch(err => {

            })
    }
    const handelSignOut = () => {
        firebase.auth().signOut()
            .then(res => {
                const signOutUser = {
                    isSignIn: false,
                    name: '',
                    email: '',
                    photo: ''
                }
                setUser(signOutUser);

            })
            .catch(err => {

            })
    }
    const handelChange = (event) => {
        let isFieldsValid = true;
        if (event.target.name === "email") {
            isFieldsValid = /\S+@\S+\.\S+/.test(event.target.value);
        }
        if (event.target.name === "password") {
            const isPassValid = event.target.value.length > 5;
            const isPassHasNum = /\d{1}/.test(event.target.value);
            isFieldsValid = isPassValid && isPassHasNum;
        }
        if (event.target.name === "name") {
            const isNameHasLength = event.target.value.length > 3;
            isFieldsValid = isNameHasLength;
        }
        if (isFieldsValid) {
            const newUserInfo = { ...user };
            newUserInfo[event.target.name] = event.target.value;
            setUser(newUserInfo);
        }
    }
    const handelSubmit = (event) => {
        if (newUser && user.email && user.password) {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then(res => {
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    updateUserName(user.name);
                    setLoggedInUser(newUserInfo);
                    history.replace(from);
                })
                .catch(error => {
                    const newUserInfo = { ...user };
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });
        }
        if (!newUser && user.email && user.password) {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
                .then(res => {
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    history.replace(from);
                })
                .catch(error => {
                    const newUserInfo = { ...user };
                    newUserInfo.error = error.message;
                    newUserInfo.success = false;
                    setUser(newUserInfo);
                });
        }
        event.preventDefault();
    }
    const updateUserName = name => {
        const user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: name
        })
            .then(res => {
                history.replace(from); 
            })
            .catch(error => {
               
            })
    }
    return (
        <div className="login-area">
            {
                newUser ? <h4>Create an Account</h4> :
                    <h4>Login</h4>
            }
            <form onSubmit={handelSubmit}>
                <div className="form-group">

                    {
                        newUser &&
                        <div>
                            <label for="Name">Name :</label>
                            <input type="text" className="form-control" name="name" id="Name" onBlur={handelChange} placeholder="Your Name" required />
                        </div>
                    }
                </div>
                <div className="form-group">
                    <label for="Email">Email :</label>
                    <input type="text" className="form-control" onBlur={handelChange} name="email" placeholder="Your Email" required id="Email" />
                </div>
                <div className="form-group ">
                    <label for="password">PassWord :</label>
                    <input type="password" className="form-control" onBlur={handelChange} name="password" placeholder="Your PassWord" required id="password" />
                </div>
                <input type="submit" className="btn btn-primary w-100 mt-3 " value={newUser ? "Create an Account" : "Sing in"} />
            </form>
            {
                newUser ? <div >
                    <label htmlFor="newUser" className="mx-2">Already have an account ? <span className="text-danger">Login</span> </label>
                    <input type="checkbox" name="newUser" id="newUser" onChange={() => setNewUser(!newUser)} />
                </div> :
                    <div>
                        <label htmlFor="newUser" className="mx-1">Don't have an account ? <span className="text-danger">Create an Account</span> </label>

                        <input type="checkbox" name="newUser" id="newUser" onChange={() => setNewUser(!newUser)} />
                    </div>
            }
            <div className="hr"></div>
            <p className="text-center">or</p>
            {
                user.isSignIn ? <button className="btn btn-primary" onClick={handelSignOut}>Sign out</button> :
                    <button className="btn btn-danger w-100 mb-2" onClick={handelGoogleSignIn}>Sign In With Google</button>
            }
        </div>
    );
}

export default Login;