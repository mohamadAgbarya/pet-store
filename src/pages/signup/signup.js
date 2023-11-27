import React from 'react'
import { useState } from 'react'
import adduser from '../../firebase'
import firebaseInstance from '../../firebase'
import { toast } from 'react-toastify'


const initialState = {
    name: '',
    email: '',
    password: ''
}
function Signup() {
    const [formValue, setFormValue] = useState(initialState)

    const onHandleChange = (e) => {
        setFormValue({ ...formValue, [e.target.name]: e.target.value })

    }

    const onFormSubmit = async (event) => {
        event.preventDefault()
        try {
            const a = await firebaseInstance.signUp(formValue)
            toast.success("Account created")
        }
        catch (err) {
            toast.error("Something went wrong")
        }

    }
    return (
        <div className="Auth-form-container">
            <form onSubmit={onFormSubmit} className="Auth-form">
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Sign Up</h3>

                    <div className="form-group mt-3">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control mt-1"
                            placeholder="e.g Jane Doe"
                            onChange={onHandleChange}
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label>Email address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control mt-1"
                            placeholder="Email Address"
                            onChange={onHandleChange}

                        />
                    </div>
                    <div className="form-group mt-3">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control mt-1"
                            placeholder="Password"
                            onChange={onHandleChange}

                        />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                    <p className="text-center mt-2">
                        Already have account?<a href="/login">Login</a>
                    </p>
                </div>
            </form>
        </div>

    )
}

export default Signup