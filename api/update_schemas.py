import re

def update_schema_file():
    file_path = '/Users/srivastavar/Documents/Rajiv/workspace/Nivra/api/schemas.py'
    
    # Read the file
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Replace all instances of Config class
    updated_content = re.sub(
        r'class Config:\n\s+from_attributes = True',
        'class Config:\n        from_attributes = True\n        orm_mode = True',
        content
    )
    
    # Write the updated content back
    with open(file_path, 'w') as file:
        file.write(updated_content)
    
    print("Updated schema file with orm_mode for all Config classes")

if __name__ == "__main__":
    update_schema_file()
