console.log("ScamSpot is active!")

const mode = 1; // 0 = label comments, 1 = hide comments

const mobile_selector = ".x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.xt0psk2.x1i0vuye.x1fhwpqd.x1s688f.x1roi4f4.x10wh9bi.x1wdrske.x8viiok.x18hxmgj";
const desktop_selector = ".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft";


// Select the body element
const body = document.querySelector('body');

// Function to process comments
function processMobileComment(comment) {
  if (comment.textContent === "Reply") {
    replyButton = comment.parentElement;
    comment_container = replyButton.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    evaluateComment(comment_container, replyButton, "mobile");
  }
}

// Function to process comments
function processDesktopComment(comment) {
  if (comment.textContent === "Reply") {    
    replyButton = comment.parentElement.parentElement;
    comment_container = replyButton.parentElement.parentElement.parentElement.parentElement.parentElement;
    evaluateComment(comment_container, replyButton, "desktop");
  }
}

// Function to process nodes
function processNodes(nodes) {
  nodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      
      extractComment(node, mobile_selector);
      extractComment(node, desktop_selector);
    }
  });
}

function extractComment(element, selector) {
  if(selector === mobile_selector) {
    element.querySelectorAll(mobile_selector)
    .forEach((comment) => {
      processMobileComment(comment);
    });
  } else if(selector === desktop_selector) {
    element.querySelectorAll(desktop_selector).forEach((comment) => {
      processDesktopComment(comment);
    });
  }
}

window.onload = function () {
  // Process existing comments
  extractComment(document, mobile_selector);
  extractComment(document, desktop_selector);

  // Observe the body element for changes to its children
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      processNodes(mutation.addedNodes);
    });
  });

  // Configure and start observing
  const observerConfig = { childList: true, subtree: true };
  observer.observe(body, observerConfig);

};


async function evaluateComment(comment_container, replyButton, device) {
  
  var text_container = null;
  if(device === "mobile") {
    text_container = comment_container.querySelector('div._a9zs');
  } else if(device === "desktop") {  
    text_container = comment_container.querySelector('.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1cy8zhl.x1oa3qoh.x1nhvcw1');
  }
  if(text_container !== null) {
    let text = text_container.textContent;
    let hash = createHash(text);

    // make request with data
    const request = new XMLHttpRequest();
    request.open('POST', 'https://scamspot-api-lpkr2.ondigitalocean.app/scam/', true);
    request.setRequestHeader('Content-Type', 'application/json');
    try {
      request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          const content = JSON.parse(this.response);
  
          var identifier = content.comment_id;
          var classifier = content.class;
          // var rating = content.score;
          category = categorizeRating(classifier);
                    
          // find report button
          const reportLink = document.querySelector('a#report-' + identifier);
          if (reportLink !== null) {
            reportLink.href = reportLink.href + "&rating=" + category;
            reportError.style.display = '';
          }
          
          // find span with id = rating
          const replace = document.querySelector('span#cr-' + identifier);
          if(replace === null) {
            return;
          }
          
          var comment_container = null;
          if(device === "mobile") {
            comment_container = replace.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
          } else if(device === "desktop") {  
            comment_container = replace.parentElement.parentElement.parentElement.parentElement.parentElement;
          }
        
          comment_container.style.filter = '';
          if (replace !== null) {
            replace.textContent = category.toUpperCase(); // + ' (' + category + ')';
  
            replace.className = 'comment-rating fetched ' + category + ' rating-' + category;
            if (mode === 1 && category === 'scam') {
              comment_container.style.display = 'none';
            } else if (mode === 1 && category === 'legit') {
              replace.style.display = 'none';
            }
            comment_container.className = 'comment-' + category + ' comment-container rating-' + category;
          }
  
  
        } else {
          console.error('Error: ' + this.status);
        }
      };
    } finally {
        // always runs
    }
  
    request.onerror = function () {
      console.error('Error: Network Error');
    };
    request.send(JSON.stringify({comment_id: hash, comment_text: text}));
    

    const ratingIdentifier = document.createElement('span');
    ratingIdentifier.id = "cr-" + hash;
    ratingIdentifier.className = 'comment-rating loading';
    ratingIdentifier.textContent = 'Loading...'; // (' + hash + ')';
    
    if (mode === 1) {
      comment_container.style.filter = 'blur(2px)';
    }
  
    const reportError = document.createElement('a');
    reportError.href = "https://hook.eu1.make.com/i2uffenbekw7dedrudi8rn364z95cp5v?comment=" + encodeURIComponent(text); // + "&username=" + username;
    reportError.target = "_blank";
    reportError.id = "report-" + hash;
    reportError.className = 'report-Button';
    reportError.textContent = 'Report error';
    reportError.style.display = 'none';
  
    replyButton.parentNode.insertBefore(reportError, replyButton.nextSibling);
    replyButton.parentNode.insertBefore(ratingIdentifier, replyButton.nextSibling);
  
  }
}


function categorizeRating(classifier) {
  if (classifier === 'spam') {
    return 'scam';
  } else {
    return 'legit'; // ham
  }
}
  
function createHash(str) {
  let hash = 0;
  if (str.length == 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
    hash = Math.abs(hash)
  }

  hash = hash + Math.floor(Math.random() * (100000 - 1) + 1);
  return hash;

}