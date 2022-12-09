import {Box,Button,Container,HStack,Input,VStack} from "@chakra-ui/react"
import './App.css';
import Message from "./Components/Message";
import{signOut , onAuthStateChanged,  getAuth,  GoogleAuthProvider,signInWithPopup} from "firebase/auth";
import { app } from "./firebase";
import { useEffect, useRef, useState } from "react";
import{getFirestore,addDoc, collection, serverTimestamp, onSnapshot, query, orderBy} from "firebase/firestore"
import GoogleButton from "react-google-button";
// import { async } from "@firebase/util";
const auth=getAuth(app);
const db=getFirestore(app);
const loginHandler=()=>{
  const provider=new GoogleAuthProvider();
  signInWithPopup(auth,provider);
}
const logoutHandler=()=>{
  signOut(auth)
 
}

function App() {
  const[user,setuser]=useState(false);
  const[message,setMessage]=useState("");
  const[messages,setMessages]=useState([]);
  const divforscroll=useRef(null);
 
  const submitHandler= async(e)=>{
    e.preventDefault();
    try{
  await addDoc(collection(db,"Messages"),{
    text:message,
    uid:user.uid,
    uri:user.photoURL
    ,
    createdAt:serverTimestamp(),
  })
  setMessage("");
  divforscroll.current.scrollIntoView({behaviour:"smooth"})
    }catch(error){
      alert(error)
  
    }
  }
  // try {
  //   await addDoc(collection(db,"Messages"),{
  //       text:"pusp",
  //       uid:user.uid,
  //       uri:user.photoURL,
  // }) catch (error) {
  //   alert(error);
  // }


  
  useEffect(()=>{
    const q=query(collection(db,"Messages"),orderBy("createdAt","asc"))
   const unsbuscribe= onAuthStateChanged(auth,(data)=>{
      setuser(data)
      console.log(data)
    });
   const unsbuscribeFormeassage= onSnapshot(q,(snap)=>{
setMessages(snap.docs.map((item)=>{

const id =item.id;
return {
  id,...item.data()
};
  
})
)
   
    });
    return()=>{
      unsbuscribe();
      unsbuscribeFormeassage();
    }
  },[])
  return (
<Box bg={"pink"}>
  {user?<Container h={"100vh"} bg={"white"}>
    <VStack  bg={"telegram.100"}h="full">
      <Button onClick={logoutHandler} colorScheme={"red"} >
        Logout
      </Button>
      <VStack h="full" w={"full"}  overflowY="auto"  bg="purple.200" css={{"&::-webkit-scrollbar":{
        display:"none"
      }}}>
      {
        messages.map((item)=>{
         return (
<Message key={item.id}  user={item.uid===user.uid?"me" :"other"}text={item.text} uri={item.uri}/>
          )
        })
      }
      
      <div ref={divforscroll}></div>
      </VStack>
      
     
      <form onSubmit={submitHandler} value={message} onChange={(e)=>
setMessage(e.target.value)}


       style={{width:"100%"}}>
       <HStack >
      <Input value={message} onChange={(e)=>
setMessage(e.target.value)} placeholder="...enter a message"/>
        <Button colorScheme={'blackAlpha'} type="submit">send</Button>
      </HStack>
      </form>
      
    </VStack>
    
  </Container>:<VStack h="100vh" justifyContent={"center"}>
    {/* <Button onClick={ loginHandler}>Signin</Button> */}
    <GoogleButton onClick={ loginHandler}/>
    </VStack>}
</Box>
        
    
  );
}

export default App;
