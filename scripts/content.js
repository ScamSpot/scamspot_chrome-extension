console.log("Hello from your Chrome extension!")



// Select the body element
const body = document.querySelector('body');

// Observe the body element for changes to its children
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (String(mutation.target.innerHTML).includes('_a9ym')) {
        // console.log(mutation);
        // console.log(String(mutation.previousSibling.className ));

        // Main Comment Load
        if (mutation.previousSibling.className === '_ae5m _ae5n _ae5o' && mutation.addedNodes.length > 0) { 
            // console.log(mutation.addedNodes[0]);

            mutation.addedNodes[0].querySelectorAll('._a9ym').forEach((comment) => {
                extractComment(comment);
            });
        }

        // Single Comment Load
        if (mutation.previousSibling.className === '_a9ym') {
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
    //console.log(comment);
    var text = comment.innerText || comment.textContent;
    const result = text.split('\n');

    //console.log("@", result[0], result[1]);
    let username = result[0];
    let commentText = result[1];
    let hash = createHash(result[0] + result[1]);
    let data = { "username": username, "comment": commentText, "hash": hash };
    
    // make request to pythonanywhere with data
    const request = new XMLHttpRequest();
    request.open('POST', 'http://127.0.0.1:5000/scam/', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        const content = JSON.parse(this.response);

        var identifier = content.comment_id;
        var rating = content.score;
        
        console.log(identifier + ": " + rating);
        
        // find span with id = rating
        const replace = document.querySelector('span#cr-' + identifier);
        if (replace !== null) {
          replace.textContent = "Rating: " + rating;

          if (rating > 50) {
            replace.className = 'comment-rating fetched scam';
          } else {
            replace.className = 'comment-rating fetched legit';
          }
        }


      } else {
        console.error('Error: ' + this.status);
      }
    };
    request.onerror = function () {
      console.error('Error: Network Error');
    };
    request.send(JSON.stringify({comment_id: hash, comment_text: commentText}));


    const replyButton = comment.querySelector('._aacl._aacn._aacu._aacy._aad6 ._a9zg._a6hd'); //._ab8y._ab94._ab99._ab9f._ab9m._ab9p._abbi._abcm

    const newParagraph = document.createElement('span');
    newParagraph.id = "cr-" + hash;
    newParagraph.className = 'comment-rating loading';

    newParagraph.textContent = 'Loading...'; // (' + hash + ')';

    replyButton.parentNode.insertBefore(newParagraph, replyButton.nextSibling);

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

    //return Math.floor(Math.random() * (12 - 1) + 1);

    return hash;

  }
  
  

