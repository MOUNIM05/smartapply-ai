import { useState } from "react"
import axios from "axios"

function Register(){

const [form,setForm] = useState({
firstName:"",
lastName:"",
email:"",
password:""
})

const handleChange = (e)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const handleSubmit = async(e)=>{

e.preventDefault()

await axios.post(
"http://localhost:5000/api/auth/register",
form
)

alert("User created")

}

return(

<div>

<h1>Register</h1>

<form onSubmit={handleSubmit}>

<input
name="firstName"
placeholder="First Name"
onChange={handleChange}
/>

<input
name="lastName"
placeholder="Last Name"
onChange={handleChange}
/>

<input
name="email"
placeholder="Email"
onChange={handleChange}
/>

<input
name="password"
type="password"
placeholder="Password"
onChange={handleChange}
/>

<button>Create Account</button>

</form>

</div>

)

}

export default Register