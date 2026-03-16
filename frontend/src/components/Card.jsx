function Card({title,value}){

return(

<div style={{
background:"white",
padding:"20px",
borderRadius:"10px",
boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
width:"200px"
}}>

<h3>{title}</h3>
<p>{value}</p>

</div>

)

}

export default Card