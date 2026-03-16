import { Link } from "react-router-dom"

function Sidebar() {

return (

<div style={{
width:"220px",
height:"100vh",
background:"#111827",
color:"white",
padding:"20px"
}}>

<h2>SmartApply</h2>

<ul style={{listStyle:"none",padding:"0"}}>

<li>
<Link to="/dashboard" style={{color:"white"}}>Dashboard</Link>
</li>

<li>
<Link to="/profile" style={{color:"white"}}>Profile</Link>
</li>

<li>
<Link to="/experiences" style={{color:"white"}}>Experiences</Link>
</li>

<li>
<Link to="/jobs" style={{color:"white"}}>Job Offers</Link>
</li>

<li>
<Link to="/generate" style={{color:"white"}}>Generate CV</Link>
</li>

</ul>

</div>

)

}

export default Sidebar  