# Mind Palace

## Distinctiveness and Complexity
The Mind Palace project is distinct from other course projects because it focuses on personal cognitive improvement by leveraging the memory palace technique to enhance memory recall, unlike a social network or e-commerce site. Users can choose their own palaces and rooms from pre-built options and decide what information or topic they want to store in each item inside a room.

The project's complexity lies in its integration of Django models, interactive JavaScript features, and mobile responsiveness. This includes model relationships such as foreign keys, content updating, and accurate content retrieval. JavaScript features like updating the user interface upon changes and sending API requests enhance interactivity. Additionally, the responsiveness of image mapping ensures that each item on the room image is accurately mapped and functions well across different screen sizes.

## Documentation
This web application is designed to help users enhance their memory and organizational skills through a digital version of the classic memory palace technique. The memory palace technique involves associating pieces of information with specific locations in an imagined space, such as a palace or room. By visualizing this space and mentally placing information in distinct areas, users can effectively organize and recall information more easily.
I created this project because I am fascinated by the potential of the human mind and wanted to enhance cognitive abilities. Additionally, I aimed to organize my learning on different programming languages. By leveraging the memory palace technique, I sought to improve memory recall and make information retention more efficient.

The application leverages graphic images to create visually appealing palaces, rooms, and items. Each palace has its own set of rooms, and each room has its own items. Each item in a room is mapped based on the image's dimensions. Every time the window is resized, the room image is automatically re-mapped to ensure responsiveness. To prepare for future updates and the addition of palaces and rooms, a Python file called constants.py was created. This file contains all the palaces and rooms, as well as their relationships. Another Python file, image_maps.py, was created to store mapping coordinates of items inside the room images. With these files, it allows for easy additions or modifications in just two places.

## File Contents
- `constants.py`: Contains the list of available palaces and rooms, and defines their relationships.
- `image_maps.py`: Contains the relevant attributes for HTML area mapping in each room image.
- `views.py`: Contains the view functions for managing user authentication and requests, including creating and retrieving palaces, rooms, item contents.
- `models.py`: Defines the database models for palaces, rooms, item topics, and subtopics.
- `urls.py`: Maps URLs to view functions.
- `static/`: Directory for static files like images, CSS, and JavaScript.
- `templates/`: Directory containing HTML templates.
    - `layout.html`: Defines the layout for the header, footer, JavaScript scripts, and CSS links.
    - `index.html`: The home page.
    - `palaces.html`: Displays the user's palaces.
    - `palace_selection.html`: Presents a list of palaces for the user to select from.
    - `rooms.html`: Shows the user's rooms within a specific palace.
    - `room_selection.html`: Presents a list of rooms for the user to select from.
    - `single_room.html`: Displays the detailed view of a specific room.
    - `error.html`: Handles access denial and page not found errors.
    - `login.html`: Handles user login.
    - `register.html`: Handles user registration

## How to Run the Application
1. Ensure you have Python installed.
2. Clone the repository: `git clone <repository-url>`
3. Navigate to the project directory: `cd mind_palace`
4. Create a virtual environment: `python -m venv venv`
5. Activate the virtual environment: `venv\Scripts\activate`
6. Install dependencies: `pip install -r requirements.txt`
7. Set up environment variables (.env File): 
    - SECRET_KEY=your_secret_key 
    - DEBUG=True
8. Run the development server: `python manage.py runserver`
9. Open your browser and navigate to `http://127.0.0.1:8000`


## Additional Information
This project includes features such as user authentication, pre-built palaces and rooms, and a responsive design. Future enhancements could introduce personalized palaces and rooms, catering to individual user preferences and needs.
