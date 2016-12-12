Project Proposal: Workflow
## Synopsis

Workflow is the improved planner/calendar that allows people to have a macro view of a user’s ongoing individual projects in each class or personal category.  As a group, we all noticed a significant lack of cohesion in our current personal scheduling and planning techniques; our information was not in one place, which made it difficult to remember everything that needed to be done. A defining feature of this product is the ability to insert different phases within projects into the user’s daily scheduled routine.  This allows for a centralized location in which to schedule and plan the different sectors of the busy life of its user.

## Motivation
Nowadays, people usually have multiple projects that have their own workflow and timeline, as well as various small to-do tasks that do not necessary have a due date. We wanted to address how a calendar could potentially help people better organize their life, moreover, improve schedule effectiveness and efficiency by minimizing stress and keeping everything in one place.  

## Features
*Individual Project View
*Individual project timeline
*Add phases to define role in a project
*Weekly view, 10-day view that can be altered towards the past/ future

## Framework and Libraries:
Bootstrap
Moment.js

## Resources:
Firebase
JQuery

## Contributors:
Fan (Linda) Yang 
Marika Rundle
Justin Ith 
Sim Singh

## License:
MIT License found in Repository


Product Specification

User Goals
* To feel a sense of relief that everything’s organized and accounted for
* Minimize stress of multiple planners
* View list of segregated to-do’s for each project
* Understand and visualize upcoming responsibilities 
* View areas / times of potential stress
* Centralize tasks and schedule in one place


Product Goal:
To help organize, visualize and centralize tasks & projects across multiple categories (classes) happening concurrently


Product Requirements
* Foundational Features
* User can sign in and out through firebase
* All information is saved on the Firebase Database
* There are ongoing short term or long-term “Projects”
* Projects have defined end dates based on the number of days that the project is running
* Projects have “Phases” within each
* Phases cannot over overlap within a Project. They are distinct time boxes
* Phases are considered completed at a certain end date
* Description of phase provided
* Projects and Phases have start and end dates
* Project input should be working forward from start date
* Default start date to today
* Users should be able to view a week level, 10-day level


Primary Use Cases / States
* Creating new responsibilities
* Inputting projects / phases / tasks
* Viewing overall project status / to-do’s


Thinking into the Future:
These are the features that we would like to implement past the due date of this project in INFO 343.  They include but are not limited to:

* Increase scope to daily view and monthly view
* Delete feature for classes, projects, phases, and tasks
* Phases have “Tasks” within them
* Tasks are specific to the phases
* Tasks are binary; they are either incomplete or complete
* Tasks have “Sub-Tasks”
* Sub-Tasks are binary
* Tasks can be viewed as completion percentages
* Tasks can have more meta data
* When a phase is clicked, user will be able to view all the tasks living in it
* Pop out task bar listing tasks defined under each category
* Project input should also include working backwards from an end date or being able to define both and end and start date
* Phases could be considered complete if all the tasks within it are completed
* If Phase is time boxed: uncompleted tasks roll over into next phase (if a next phase exists)
* If Phase is task contingent: input expected completion date or amount of dates to complete (for the visual sake of the calendar)
* Tasks could or could not have expected time completion needs
* Tasks can be day specific or live across multiple days
* Tasks can be easily replicated from phase to phase


Widen scope to include calendar sharing
* Web application becomes interactive across users
* Projects to be completed by a group could be scheduled simultaneously
* These projects will appear in each individual’s workflow profile
* Users interaction: team lead can assign task to people  


Timeline
Week 1 Nov.28 - Dec.4:
* Finish Basic View of Calendar
* Weekly View
* Draft Basic View of Swimming lanes

Week 2 Dec.5 - Dec.12:
* Integrate the features with the basic view
* Add projects
* Add phases
* Create ability to see past schedule or future schedule 
* Fix any bugs and improve the styling of the website app
* Brainstorm and solidify style - colors, fonts, etc.
* Convert into mobile view 
* Prepare app for Final Project Fair (December 8th, 2016)

Future:
* Complete future product goals
* Create domain name
* Make available to others 
* Expand users


