import DashboardLayout from "../layouts/DashboardLayout"
import Card from "../components/Card"

function Dashboard(){

return(

<DashboardLayout>

<h1>Welcome to SmartApply AI</h1>

<div style={{
display:"flex",
gap:"20px",
marginTop:"20px"
}}>

<Card title="Experiences" value="3"/>

<Card title="Skills" value="8"/>

<Card title="Documents" value="2"/>

</div>

</DashboardLayout>

)

}

export default Dashboard