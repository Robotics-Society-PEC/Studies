# Studies

## Fork

> [!NOTE]  
> This is supposed to be a fork of the [PEC-CSS/PEC-Previous-Year-Papers](https://github.com/PEC-CSS/PEC-Previous-Year-Papers), but the git history was almost too professional to look at so I had to remove it.

## About The Project

PEC Paper is an open source project started to help PEC students find previous year papers in one place, hence helping them to prepare for exams.

> [!CAUTION]
> Just looking at the papers won't help, you have to read them also

## Current Chores

- Clean up the Database
  - Convert all formats to PDF
  - Sort out duplicate papers
  - Update the [json](src\data\papers.json)
- Add a PDF Download Button
- Add Github repository ICON
- Add Contributor Credit
- Add Dark Mode

## Implementation Idea

- To Upload new Papers, there will be a form in which the cource code, Subject name Branch and year will be made. Then the user will have to singin into github using OAuth, the Webpage will:
  - fork the main repository
  - upload the paper to the fork, and update the json
  - then create a pull request in the main repository
  - the pull request will be merged by the repository owner and then the changes will be live on the website
- Taking this approach further we can add a Peer-to-Peer database, in which people can volunteer, to have their device being used as a database for this project, the files will be spread across multiple users and will be fetched from the nearest user, in case their is no peer online the pdf will be served from github.

## Homage to the Original Creators

<a href="https://github.com/PEC-CSS/PEC-Previous-Year-Papers/graphs/contributors">
  <img src="https://contrib.rocks/image?PEC-CSS/PEC-Previous-Year-Papers" />
</a>

## Current Contributors

<a href="https://github.com/Robotics-Society-PEC/Studies/graphs/contributors">
  <img src="https://contrib.rocks/image?Robotics-Society-PEC/Studies" />
</a>
