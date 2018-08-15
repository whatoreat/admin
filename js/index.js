(function() {
  console.log("ERERE");

  document.getElementById("btnGoogleSignIn").addEventListener("click", loginWithGoogle);

  document.getElementById("btnSignOut").addEventListener("click", signOut);

  document.getElementById("getNewPostID").addEventListener("click", getNewPostID);
  document.getElementById("upload").addEventListener("click", uploadIMG);
  document.getElementById("uploadHTML").addEventListener("click", uploadHTML);

  const auth = firebase.auth();
  // console.log(auth);

  function loginWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  }

  function signOut() {
    auth.signOut().then(function() {
      // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
    });
  }

  function getNewPostID() {
    httpRESTAsync("GET", "https://us-central1-whatoreat-testdb.cloudfunctions.net/createNewPost", null, function(res) {
      document.getElementById("newPostID").innerHTML = res;
    })
  }

  function uploadIMG2() {
    var postID = document.getElementById("newPostID").innerHTML;
    if (postID !== "None") {
      var storageRef = firebase.storage().ref();
      var spaceRef = storageRef.child(postID);
      var Filelist = document.getElementById("selectedIMG").files;
      var lengthOfImages = Filelist.length;
      if (lengthOfImages == 0) {
        console.log("No files")
        return
      }
      var counter = 0;
      for (count = 0; count < lengthOfImages; count++) {
        var spaceRef = storageRef.child(postID + "/" + Filelist[count].name);
        spaceRef.put(Filelist[count]).then(function(snapshot) {
          counter++;
          if (counter == lengthOfImages) {
            console.log('Uploaded done');
          }
        });
      }
    } else {
      alert("Create Post First")
    }
  }


  async function uploadIMG() {
    var postID = document.getElementById("newPostID").innerHTML;
    var Filelist = document.getElementById("selectedIMG").files;

    var numberOfFile = Filelist.length;

    var data = {
      fileName: postID,
      fileContent: {}
    }

    const readFileAsync = file => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = evt => resolve(evt.target.result)
      reader.readAsDataURL(file)
    })

    for (let i = 0; i < numberOfFile; i++) {
      data.fileContent[Filelist[i].name] = await readFileAsync(Filelist[i])
      // data.fileContent[Filelist[i].name] = "!@#!@#!@#"
    }
    event.target.value = null

    console.log(data)

    httpRESTAsync("POST", "https://us-central1-whatoreat-testdb.cloudfunctions.net/uploadIMG", data, function(res) {
      console.log(JSON.parse(res));
    })

  }

  function uploadHTML() {
    console.log("EEEEE")

    var postID = document.getElementById("newPostID").innerHTML;
    var html = document.getElementById("selectedHTML").files[0];

    var reader = new FileReader();
    reader.onload = function() {
      var dataURL = reader.result;
      var data = {
        fileName: postID,
        fileContent: dataURL
      }
      console.log(data)
      httpRESTAsync("POST", "https://us-central1-whatoreat-testdb.cloudfunctions.net/uploadHTML", data, function(res) {
        console.log(JSON.parse(res));
      })

    };
    reader.readAsDataURL(html);
  }


  auth.onAuthStateChanged(function(user) {
    if (user) {
      console.log(user);
      document.getElementById("status").innerHTML = "IN";
    } else {
      document.getElementById("status").innerHTML = "OUT";
    }
  })

  function httpRESTAsync(type, theUrl, data, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open(type, theUrl, true); // true for asynchronous
    if (type == "POST") {
      // xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
      xmlHttp.setRequestHeader("Content-type", "application/json");
      xmlHttp.send(JSON.stringify(data));
    } else {
      xmlHttp.send(null);
    }
  }
})();