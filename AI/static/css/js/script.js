
    // Function to handle form submission
    function handleSubmit(question) {
        var formData = new FormData();
        formData.append('question', question);
    
        // Clear input field
        document.getElementById('questionInput').value = '';
    
        // Create a new response element for the user's question
        var userQuestionElement = document.createElement('div');
        userQuestionElement.className = 'response';
        userQuestionElement.innerHTML = "<h3>You:</h3>" + question ;
    
        // Append the user's question to the response container
        document.getElementById('responseContainer').appendChild(userQuestionElement);
    
        // Scroll to bottom of the response container
        document.getElementById('responseContainer').scrollTop = document.getElementById('responseContainer').scrollHeight;
    
        // Make AJAX request to get the response from the server
        fetch('/ask', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            // Create a new response element for the server's response
            var serverResponseElement = document.createElement('div');
            serverResponseElement.className = 'response';
            serverResponseElement.innerHTML = "<h3>G-AI:</h3> " + data  ;
    
            // Append the server's response to the response container
            document.getElementById('responseContainer').appendChild(serverResponseElement);
    
            // Scroll to bottom of the response container
            document.getElementById('responseContainer').scrollTop = document.getElementById('responseContainer').scrollHeight;
        });
    }
    
    // Function to validate form before submission
    function validateForm() {
        var questionInput = document.getElementById('questionInput').value.trim();
        if (questionInput === '') {
            alert('Please enter your question');
            return false; // Prevent form submission
        }
        return true; // Allow form submission
    }
    
    // Function to handle button click
    function askQuestion() {
        var questionInput = document.getElementById('questionInput').value.trim();
        if (questionInput === '') {
            alert('Please enter your question');
            return; // Stop function execution
        }
        handleSubmit(questionInput);
    }
    
    // Attach event listener to input field to clear responses when input is empty
    document.getElementById('questionInput').addEventListener('input', function() {
        if (this.value === '') {
            document.getElementById('responseContainer').innerHTML = ''; // Clear response container
        }
    });
    
    // Attach event listener to clear button to clear all responses
    document.getElementById('clearButton').addEventListener('click', function() {
        document.getElementById('responseContainer').innerHTML = ''; // Clear response container
    });
    
    // Function to handle form submission on pressing Enter key
    document.getElementById('questionForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        askQuestion(); // Call askQuestion function to handle the submission
    });
    