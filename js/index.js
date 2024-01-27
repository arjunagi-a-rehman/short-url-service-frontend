const baseUrl="https://sus9.in"
document.addEventListener("DOMContentLoaded", function () {
  initializeSmoothScroll();
  initializeNavigation();
  activateOnScroll();
});

function initializeSmoothScroll() {
  var navLinks = document.querySelectorAll('.navbar-nav a');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var targetId = this.getAttribute('href').substring(1);
      document.getElementById(targetId).scrollIntoView({
        behavior: 'smooth'
      });
      closeMobileNavbar();
    });
  });
}

function initializeNavigation() {
  var pages = document.querySelector('#pages').getElementsByTagName("li");

  // Set 'Home' as the default selected page
  pages[0].classList.add("active");

  for (var i = 0; i < pages.length; i++) {
    pages[i].addEventListener("click", function () {
      removeActiveClass(pages);
      this.classList.add("active");
    });
  }
}

function removeActiveClass(pages) {
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }
}

function closeMobileNavbar() {
  var navbarToggle = document.querySelector('.navbar-toggler');
  if (navbarToggle) {
    navbarToggle.click();
  }
}

function activateOnScroll() {
  var sections = document.querySelectorAll('section');
  var options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  var observer = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var targetId = entry.target.getAttribute('id');
        setActiveNavLink(targetId);
      }
    });
  }, options);

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

function setActiveNavLink(targetId) {
  var navLinks = document.querySelectorAll('.navbar-nav a');
  var pages = document.querySelector('#pages').getElementsByTagName("li");

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href').substring(1);
    if (href === targetId) {
      removeActiveClass(pages);
      link.parentElement.classList.add('active');
    }
  });
}

function copyToClipboard(elementId,buttonId) {
  console.warn(elementId);
  // Select the text to copy
  var shortUrlElement = document.getElementById(elementId);
  var button=document.getElementById(buttonId);
  button.innerText='✓';
  setTimeout(() => {
    button.innerText='📋';
  }, 5000);
  var textToCopy = shortUrlElement.innerText;

  // Create a temporary input element and set its value to the text to copy
  var tempInput = document.createElement('input');
  tempInput.value = textToCopy;
  document.body.appendChild(tempInput);

  // Select the text in the input element
  tempInput.select();
  tempInput.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text to the clipboard
  document.execCommand('copy');

  // Remove the temporary input element
  document.body.removeChild(tempInput);
}

function generateShortUrl(){
  var longUrl=document.querySelector('#LongURL').value;
  var expiry=document.querySelector('#Expiry').value;
  var errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = "";
  // Check if longUrl is empty or null
  if (!longUrl) {
    errorMessage.textContent = "Long URL cannot be empty. Please enter a valid URL.";
    return;
  }
  callGenerateShortUrlApi(longUrl,expiry);
  
}
function showGeneratedOutPut(shortUrlCode,longUrl,expiry){
  var outputContainer=document.getElementById("G-output");
  outputContainer.innerHTML=`
  <div class="short-url-details">
            <span class="tag short-url" >Short URL: </span>
            <span class="details" id="G-short-url">https://sus9.in/${shortUrlCode}</span>
            <button class="float-right clip-button" id="generator-button" onclick="copyToClipboard('G-short-url','generator-button')">📋</button>
          </div>
          <div class="short-url-details">
            <span class="tag">Long URL: </span>
            <span class="details">${longUrl}</span>
          </div>
          <div class="short-url-details">
            <span class="tag">Expiry date: </span>
            <span class="details">${expiry}</span>
          </div>
  `;
}

function fetchShortUrlDetails(){
  var shortUrl=document.querySelector('#shortUrl').value;
  console.log(shortUrl);
  var errorMessage = document.getElementById('detailsErrorMessage');
  const domain="https://sus9.in/"
  if(shortUrl.startsWith(domain)){
    console.log(shortUrl)
    errorMessage.textContent="";
    callGetDetailsApi(shortUrl.substring(domain.length));
  }else{
    errorMessage.textContent="invalid URL";
  }
}
function showInsightDetailsOutPut(shortUrlCode,longUrl,expiry){
  var innerHtml=`<div class="short-url-details">
  <span class="tag" id="fetched-short-url">Short URL: </span>
  <span class="details">https://sus9.in/${shortUrlCode}</span>
  <button class="float-right clip-button" id="fetched-button" onclick="copyToClipboard('fetched-short-url','fetched-button')">📋</button>
</div>
<div class="short-url-details">
  <span class="tag">Long URL: </span>
  <span class="details">${longUrl}</span>
</div>
<div class="short-url-details">
  <span class="tag">Expiry date: </span>
  <span class="details">${expiry}</span>
</div>
`;
  var outputContainer=document.getElementById("F-output");
  outputContainer.innerHTML=innerHtml;
}

function callGenerateShortUrlApi(longUrl,expiryDate){
  const requestBody = {
    url: longUrl,
    expiryDate: expiryDate
  };
  var output;
  const url=baseUrl+"/url"
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // You might need to include additional headers based on the API requirements
    },
    body: JSON.stringify(requestBody),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          // Display the error message on the page
          var errorMessage = document.getElementById('errorMessage');
          if(response.status===400){
            errorMessage.textContent="invalid URL";
            return;
          }
          errorMessage.textContent = errorData.errorMessage;
          console.log(errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      // Handle the successful response
      console.log(data)
      console.log('Success:', data['shortUrlCode']);
      showGeneratedOutPut(data['shortUrlCode'],data['originalUrl'],data['expiryDate']);
      output=data;
      // You can do further processing with the response data here
    })
    .catch(error => {
      // Handle errors
      console.error('Error:', error);
    });
    if(output){
      console.log(output)
    }
}
function callGetDetailsApi(shortCode){
  
  url=baseUrl+'/details/'+shortCode;
  console.log(url);
  fetch(url,{
    method:'GET',
    headers: {
      'Content-Type': 'application/json',
    },
 
  }).then(
    response=>{
      if(!response.ok){
        var errorMessage = document.getElementById('detailsErrorMessage');
          if(response.status===400){
            errorMessage.textContent="invalid URL";
            return;
          }
          errorMessage.textContent = errorData.errorMessage;
          console.log(errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json()
    }
  ).then(data => {
    // Handle the successful response
    console.log(data)
    console.log('Success:', data);
    showInsightDetailsOutPut(data['shortUrlCode'],data['originalUrl'],data['expiryDate']);
    // You can do further processing with the response data here
  })
  .catch(error => {
    // Handle errors
    console.error('Error:', error);
  });
}