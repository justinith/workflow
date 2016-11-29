# workflow
A productivity management tool that optimizes the workflow of those who juggle many unrelated projects concurrently

#Project Proposal

## Synopsis

Workflow is the improved planner/calendar that allows people to have a macro view of their ongoing different group/individual projects, as well as have a micro view of small tasks.  A defining feature of this product is the ability to insert the “small tasks” into user’s daily scheduled routine automatically when there exists a break in the schedule.  This allows for a centralized location in which to schedule and plan the busy life of its user.

## Motivation

Nowadays, people usually have multiple projects that have their own workflow and timeline, as well as various small to-do tasks that aren’t necessary have a due date. How a calendar can help people better brush out and organize their life, moreover, improve their effectiveness by helping people organize their daily/weekly/monthly routine. 

## Framework and Libraries

Bootstrap

## Contributors

Fan (Linda) Yang
Marika Rundle
Justin Ith
Sim Singh

#Product Spec

**User Goals**
  *To feel a sense of relief that everything’s organized and accounted for, and that you don’t have to juggle everything in your head
  *Getting list of to-do’s confidently
  *Getting a grasp of what’s upcoming
  *Seeing areas / times of potential stress
  *Centralize tasks and schedule in one place


**Product Goal**
  To help organize tasks & projects across multiple projects happening concurrently


**Product Requirements**
  *Foundational Features
    *There are ongoing, long-term “Responsibilities”
      *Responsibilities do not have defined end dates
    *Responsibilities have “Projects”
    *Projects have “Phases” within it
      *Phases cannot over overlap within a Project. They are distinct time boxes
      *Phases are considered completed at a certain end date
    *Projects and Phases have start and end dates
    *Phases have “Tasks” within them
      *Tasks are specific to the phases
      *Tasks are binary; they are either incomplete or complete
    *Project input should be working forward from start date
      *Default start date to today
    *Users should be able to view a day level, week level


**Basic Features**
  *Projects can happening concurrently within and outside of Responsibilities
  *Phases could also be considered complete if all the tasks within it are completed
    *If Phase is time boxed: uncompleted tasks roll over into next phase (if a next phase exists)
    *If Phase is task contingent: input expected completion date or amount of dates to complete (for the visual sake of the calendar)
  *Tasks could or could not have expected time completion needs
  *Tasks can be day specific or live across multiple days
  *Tasks can be easily replicated from phase to phase


**Stretch Features**
  *Tasks have “Sub-Tasks”
    *Sub-Tasks are binary
  *Tasks can be viewed as completion percentages
  *Tasks can have more meta data
  *Users should be able to view a month level
  *Users can see the overall status of a project and phase
  *Project input should also include working backwards from an end date or being able to define both and end and start date


**Primary Use Cases / States**
  *Creating new responsibilities
  *Inputting projects / phases / tasks
  *Viewing overall project status / to-do’s
