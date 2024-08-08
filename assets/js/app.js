const cl = console.log;

const postscontainer = document.getElementById("postscontainer");
const titleControl = document.getElementById("title");
const ContentControl = document.getElementById("Content");
const postform = document.getElementById("postform");
const userIdControl = document.getElementById("userId");
const submitbtn = document.getElementById("submitbtn");
const updatebtn = document.getElementById("updatebtn");
const loader = document.getElementById("loader");

const BASE_URL = `https://deepti-project-f0257-default-rtdb.asia-southeast1.firebasedatabase.app/`;

const POST_URL = `${BASE_URL}/posts.json`; //this url will be used for GET and POST method

let postsArr = [];



const sweetalert = (msg, iconstr)=>{
    swal.fire({
        title:msg,
        timer:2000,
        icon:iconstr
    })  
}

const templatingofCards = (arr) =>{
    postscontainer.innerHTML = arr.map(post=> {

        return `
                <div class="col-md-4 mb-3">
                <div class="card postcard h-100" id="${post.id}">
                    <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${post.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn btninfo" onclick = "onEdit(this)">Edit</button>
                    <button class="btn btn btnrem" onclick = "onRemove(this)">Remove</button>
                    </div>
                </div>
            </div>`
                
        
    }).join("");
}

const makeApiCall = (methodName, api_url, msgBody=null)=>{
    loader.classList.remove(`d-none`)
     return new Promise ((resolve,reject) =>{
        let xhr = new XMLHttpRequest();

        xhr.open(methodName, api_url)

        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status < 300){
             let data = JSON.parse(xhr.response);
             resolve(data)
            }else{
                reject(`something went wrong !!!`)
            }
            // loader.classList.add(`d-none`)
        }
        xhr.onerror = function(){
            loader.classList.add(`d-none`)
        }
       
        xhr.send(JSON.stringify(msgBody))

    })
}

const fetchposts = () =>{
    makeApiCall("GET" , POST_URL) 
    .then(res => {
        cl(res)
        //we will cb here
        let postArr = [];
        for(const key in res){
            let obj = {...res[key], id:key}
            // obj.id = key;
            postArr.push(obj)
            cl(postArr)
        }
        templatingofCards(postArr)
        
    })
    .catch(err =>{
        cl(err)
    }) 
    .finally(()=>{
        
        loader.classList.add(`d-none`)
    })
}
fetchposts()

 

const onAddpost = (eve)=>{
    eve.preventDefault();

    let newpost = {
        title:titleControl.value,
        body:ContentControl.value,
        userId:userIdControl.value
    }

makeApiCall("POST" , POST_URL, newpost) 
.then(res => {
    cl(res)
    //we will cb here and create a card
    newpost.id = res.name;
    let card = document.createElement(`div`);
    card.classList = `col-md-4 mb-3`
    // card.id = newpost.id;
    card.innerHTML = `<div class="card postcard h-100" id="${newpost.id}">
                    <div class="card-header">
                        <h3 class="m-0">${newpost.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">${newpost.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn btninfo" onclick = "onEdit(this)">Edit</button>
                    <button class="btn btn btnrem" onclick = "onRemove(this)">Remove</button>
                    </div>
                </div>`
                postscontainer.prepend(card);
                sweetalert(`${newpost.title} is added successfully`, "success")
})
.catch(err =>{
    cl(err)
})
.finally(()=>{
    postform.reset()
    loader.classList.add(`d-none`)
})

}

const onEdit = (ele) =>{
    //editid
    let editId = ele.closest(`.card`).id;
    // cl(editId)

    localStorage.setItem("editId", editId);

    //Edit URL
    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`

    //API call
    makeApiCall("GET", EDIT_URL)
    .then(res => {
        cl(res) //we will get a single object, to patch the obj in form
        titleControl.value = res.title;
        ContentControl.value = res.body;
        userIdControl.value = res.userId
        
        window.scrollTo(0,0,"smooth")
    })
    .catch(err => {
        cl(err)
    })
    .finally(()=>{
        
        loader.classList.add(`d-none`)
        updatebtn.classList.remove(`d-none`);
        submitbtn.classList.add(`d-none`)
    })
}

const onupdatepost = () => {
    //update Id

    let updateId = localStorage.getItem("editId");
    cl(updateId)

    //updated URL

    let UPDATE_URL = `${BASE_URL}/posts/${updateId}.json`

    //Updated obj

    let updatedobj = {
        title:titleControl.value,
        body:ContentControl.value.trim(),
        userId:userIdControl.value
        
    }
    

    //API call
    makeApiCall("PATCH", UPDATE_URL, updatedobj)
    .then(res =>{
        cl(res) //if is is success
    //callback functionality - to update in UI
    let card = [...document.getElementById(updateId).children]
    // cl(card)
    card[0].innerHTML = `<h3 class="m-0">${updatedobj.title}</h3>`
    card[1].innerHTML = ` <p class="m-0">${updatedobj.body}</p>`
    sweetalert(`${updatedobj.title} is updated successfully`, "success")
    })
    .catch(err =>{
        cl(err)
    })
    .finally(()=>{
        postform.reset()
        updatebtn.classList.add(`d-none`);
        submitbtn.classList.remove(`d-none`)
        loader.classList.add(`d-none`)
    })


}

const onRemove = (ele) =>{

    Swal.fire({
        title: "Are you sure?",
        text: "You won't to removed this post!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!"
      }).then((result) => {
        if (result.isConfirmed) {
          //removeId

    let RemoveId = ele.closest(`.card`).id;


    //removeURL

    let REMOVE_URL = `${BASE_URL}/posts/${RemoveId}.json`


    //API call
    makeApiCall("DELETE", REMOVE_URL)
    .then(res =>{
        ele.closest(`.card`).parentElement.remove() //callback functionality
    })
    .catch(err =>{
        cl(err)
    })
    .finally(()=>{
       
        loader.classList.add(`d-none`)
    })

        }
      });
    

    
}



postform.addEventListener("submit", onAddpost)
updatebtn.addEventListener("click", onupdatepost)