console.log("Instagram Spam Checker active!")

const mode = 1; // 0 = label comments, 1 = hide comments

// Select the body element
const body = document.querySelector('body');

// Observe the body element for changes to its children
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    //console.log(mutation);
    if (String(mutation.target.innerHTML).includes('_a9ym')) {
        //console.log(mutation);

        // Main Comment Load
        //if (mutation.previousSibling.className === '_ae5m _ae5n _ae5o' && mutation.addedNodes.length > 0) { 
        if (mutation.addedNodes.length > 0) { 
          mutation.addedNodes[0].querySelectorAll('._a9ym').forEach((comment) => {
            //console.log("Main Comment Load");
            extractComment(comment);
          });
        }
        
        if (mutation.addedNodes[0] !== undefined && mutation.addedNodes[0].className === '_a9ym') {
          extractComment(mutation.addedNodes[0]);
        }

    }
  });
});

observer.observe(body, {
  childList: true,
  subtree: true,
});


async function extractComment(comment) {
  // console.log(comment);
  var text = comment.innerText || comment.textContent;
  //console.log(text);

  if(text !== "Load more comments") {
    //const result = text.split('\n');
    const result = text.split('\n').filter(line => !line.includes('View replies'));

    let username = result[0];
    let commentText = result.slice(1, -1).join(' ');

    let hash = createHash(result[0] + result[1]);

    let data = { "username": username, "comment": commentText, "hash": hash };
    
    //request.open('POST', 'http://127.0.0.1:5000/scam/', true);

    // make request with data
    const request = new XMLHttpRequest();
    request.open('POST', 'https://ig-scam-checker-obfcb.ondigitalocean.app/scam/', true);
    request.setRequestHeader('Content-Type', 'application/json');
    try {
      request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          const content = JSON.parse(this.response);
  
          var identifier = content.comment_id;
          var classifier = content.class;
          // var rating = content.score;
          category = categorizeRating(classifier);
          
          //console.log(identifier + ": " + rating);
          
          // find report button
          const reportLink = document.querySelector('a#report-' + identifier);
          if (reportLink !== null) {
            reportLink.href = reportLink.href + "&rating=" + category;
            reportError.style.display = '';
          }
          
          // find span with id = rating
          const replace = document.querySelector('span#cr-' + identifier);
          const comment_container = replace.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
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
    request.send(JSON.stringify({comment_id: hash, comment_text: commentText}));

    // console.log(comment)

    // see image in docs & http://stevewellens.xtreemhost.com/jQuerySelectorTester.htm?i=1
    // HTML = console.log(comment)
    // Search Pattern = adapted JS Selector (remove the classes at the beginning)
    
    const buttons = comment.querySelectorAll('.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > span > button')
    const replyButton = buttons[buttons.length - 1]
    //console.log(replyButton);

    const ratingIdentifier = document.createElement('span');
    ratingIdentifier.id = "cr-" + hash;
    ratingIdentifier.className = 'comment-rating loading';
    ratingIdentifier.textContent = 'Loading...'; // (' + hash + ')';
    
    if (mode === 1) {
      const comment_container = replyButton.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
      comment_container.style.filter = 'blur(2px)';
    }

    const reportError = document.createElement('a');
    reportError.href = "https://hook.eu1.make.com/i2uffenbekw7dedrudi8rn364z95cp5v?comment=" + encodeURIComponent(commentText) + "&username=" + username;
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