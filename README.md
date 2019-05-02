# org-chart.js
Org Chart using WebComponent

# Info

This is a simple WebComponent based Org Chart.

It will take a tree structure and provide organizational tree chart, with team and team manager's details.

It will also show consolidated count of all the reportees for that particular manager.

On clicking of team name, it will toggle detail view.

P.S: Only one team can be expanded at each level.

# Setup

1. sudo npm install http-server -g
2. http-server -p 1337
3. http://localhost:1337/

# Issues

1. Connection arrows are not proper. [Need to fix pseudo selectors for first and last child of custom component].
2. No carousel view for more than 4 items.
