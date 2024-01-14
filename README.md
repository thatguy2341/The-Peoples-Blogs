Welcome to the people blogs website, source code!
This is a project I made almost fully on my own(credits at the bottom). 

DESCRIPTION
  This website is a social website, it allows multiple users at once, the users can message eachother.
  In the website you can create blogs (currently 2 per user) and on these blogs you can post anything you like! Pictures, stories, videos even all together.
  There is a comment section for each post, and there is a viewing system which shows how many people read your blogs and posts.
  Of course there is a profile page, which you can edit your details, and have a sum of all your user work.
  The password are kept hashed and salted, so don't be worried (but always try and use strong passwords).
  There is a detection system that wont let you exit a page in the middle writing a blog or a post, so you wont accidently delete all your progress.
  Of course there is a warning system for deleting posts and blogs.
  You can contact me on the website if you would like.

Why did I took this project upon myself? 
  I started this project, because I fell in love with full stack development. I have a unique curiousity, which anytime I meet something new, makes me take on HUGE projects.
  I also love designing projects. I designed this website to be unique, and to be my own, I didn't copy any designs from other websites.

How did I design the website?
  Well, I worked purely on what I call: idea -> let's try, basis. Each time I had an idea, without having any clue on how, I tried to create it.
  This 'basis' made my capabilities evolve over time. 
  I first started by just typing code, until the idea worked. then I learned to use google and youtube to help.
  Then I learned to plan ahead, by first drawing a scheme of how the idea should look like and work.
  Then I learned to write organized code, after this I decided to go and painstakingly change ALL the code and organize it.
  It took almost 5 whole days to reorganize the code (JS in the MVC Pattern and turn the Flask code to be modular).

Any hardships?
  MANY, so much, I can't remember all of them.
  The four biggest ones were: 
  1. In the flask framework there is a library called Flask-login, which for months I used, but when I tried to make the website multi user based, I was stumped.
     The Flask-login library doesn't work with multiple users, so I had to scrap most of the authentication code, and create an authentication system of my own, which at the time I had no Idea how.
  2. The first javascript feature I wrote was the search system, and I had no idea how to actually create it, so for multiple times I had to scrap a lot of it and start from scratch (that is why the search system is called searchSystem3.0)
  3. I made the javascript part of the website before I learned to organize JS in the MVC pattern, which made it hell to change or add any feature to the website, so I decided to organize more than 1000 lines of unorganized JS code, which took 5 days.
  4. Adding socket based communication to the website, was so difficault, I almost quit at the end. This is because, after everything worked on my computer, I pushed the code to the render server and everything broke, I had no idea what was the problem, and thought the problem was on the render side, but after A LOT of searches I found the problem and fixed it.




CREDITS:
  credit to my friends who helped with suggestions.
  credit to my python course which helped start the project -> https://www.udemy.com/share/103IHM3@gWqVjt-zMyYK7rEtcO8hutWOaQgxnPBfzq7a6sJOu9cUs75iBMQ3MomIAGxNp20w7A==/
