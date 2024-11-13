# Define palace details
palace_info = {
    "Office Building": {
        "image": 'palace-1.png',
        "description": "Step into a productive environment where innovation meets functionality, all set for a grand reveal."
    },
    "Art Gallery": {
        "image": 'palace-2.png',
        "description": "Immerse yourself in a space dedicated to creativity and masterpieces, waiting to ignite your imagination"
    }
}

# Generate palaces list 
palaces = [{"name": name, "image": details["image"], "description": details["description"]} for name, details in palace_info.items()]

# Define rooms for each palace
rooms = {
    "Office Building": [
        {
            "name": "Meeting Room",
            "image": 'office-1.png',
            "description": "A collaborative space where ideas converge and strategies take shape, designed for dynamic discussions."
        },
        {
            "name": "Workspace",
            "image": 'office-2.png',
            "description": "A hub of productivity and creativity, this workspace is tailored to inspire and drive innovation."
        }
    ],
    "Art Gallery": [
        {
            "name": "Exhibition Hall",
            "image": 'gallery-1.png', 
            "description": "An elegant venue showcasing creativity and artistry, perfect for displaying masterpieces and inspiring awe."
        },
        {
            "name": "Workshop",
            "image": 'gallery-2.png', 
            "description": "A hands-on environment where skills are honed and creativity flourishes, ideal for practical learning and innovation."
        }
    ]
}