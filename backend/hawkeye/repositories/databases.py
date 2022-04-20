'''
    This file creates a SQL database to store data for use in 
    NebulaVision.
'''

import os

import sqlite3
import json
import pandas as pd
from uuid import uuid4


import hawkeye.repositories.queries as q
import hawkeye.domain.model as dm

class DataBase(object):

    '''
        Creates a database and updates its contents accordingly for each new dataset.

        Args:
            root: Root directory of the repository.

        Attributes:
            db_dir: Path to directory containing the database file.
            conn: Connection to database.
    '''

    def __init__(self, init=True):
        if init:
            self.conn_db()
        else:
            self.conn = None

    def conn_db(self, db_path=os.path.join('data', 'databases', 'Hawkeye.db')):
        '''
            Connects to a database in the specified directory.

            Args:
                db_path: Path to the database
        '''

        # Establish valid connection
        try:
            self.conn = sqlite3.connect(db_path, check_same_thread=False)
        except sqlite3.Error as e:
            print(e)

    def close_db(self):
        '''
            Closes the connection to the database.
        '''

        self.conn.close()

    def create_tables(self, reset=False):
        '''
            Create or re-create empty tables in the database.
        '''

        tables = q.SCHEMA.keys()

        # Execute SQLite queries
        if self.conn:
            c = self.conn.cursor()
            for t in tables:
                if reset:
                    c.execute(f'DROP TABLE IF EXISTS {t} ;')
                c.execute(q.build_table(t))
                # Default project
            
            c.execute(f"INSERT INTO project (name) VALUES ('Default Project')")

            self.conn.commit()
        else:
            print("Invalid connection to database, please try again later")

    def add_project(self, project):
        '''
            Adds a new project to the database and modifies the corresponding
            tables.

            Args:
                project: Name of the project where the dataset has been collected from.
        '''

        c = self.conn.cursor()

        # Add project to table
        c.execute(q.insert_query('project'), (project, ))

        self.conn.commit()

    def del_project(self, project_id):
        '''
            Deletes an existing project in the database and modifies the corresponding
            tables.

            Args:
                project_id: ID of the project where the dataset has been collected from.
        '''

        c = self.conn.cursor()

        # Delete entries as required
        pid = (project_id, )  # Convert to tuple
        c.execute(q.del_query('project', 'id'), pid)
        c.execute(q.del_query('image', 'project_id'), pid)

        self.conn.commit()

    def get_all_projects(self):
        '''
            Returns all project in the database
        '''
        c = self.conn.cursor()
        return c.execute(q.ALL_PROJECTS).fetchall()
    
    def get_project(self, p_id):
        '''
            Returns the project of the corresponding project id in the database
            
            Args:
                p_id : ID of the project to return
        '''
        c = self.conn.cursor()
        return c.execute(q.filter_query('*', 'project','id'),(p_id,)).fetchone()
    
    def add_image(self, img_id, width, height, project_id, dset, labelled):
        '''
            Add new image to the database and modifies the corresponding
            tables.

            Args:
                img_id: ID of specified image.
                width: Integer width of image in pixels.
                height: Integer height of image in pixels.
                project_id: ID of the project where the image has been collected from.
                dset: String to denote image is in training set or testing set.
                labelled: BIT (0 or 1) to denote whether the image is labelled or not
        '''

        c = self.conn.cursor()

        # Add image details to table
        c.execute(q.insert_query('image', id_=True),
                  (img_id, width, height, project_id, dset, labelled))
        self.conn.commit()

    def del_image(self, img_id):
        '''
            Deletes an existing image in the database and modifies the corresponding
            tables.

            Args:
                img_id: ID of specified image.
        '''

        c = self.conn.cursor()

        # Delete entries as required
        iid = (img_id, )
        c.execute(q.del_query('image', 'id'), iid)
        c.execute(q.del_query('region', 'image_id'), iid)
        
    def get_project_images(self, p_id):
        '''
            Returns all images in the project given its project id
            
            Args:
                p_id : ID of the project
        '''
        c = self.conn.cursor()
        f_query = q.filter_query('*', 'image', 'project_id')
        return c.execute(f_query, (p_id,)).fetchall()
    
    def get_project_train_images(self, p_id):
        '''
            Returns all training images in the project given its project id
            
            Args:
                p_id : ID of the project
        '''
        c = self.conn.cursor()
        f_query = q.double_filter_query('image_id', 'image', 'project_id', 'dataset')
        return c.execute(f_query, (p_id, 'train')).fetchall()

    def get_labelled_images(self, p_id):
        '''
            Returns all labelled images in the project given its project id
            
            Args:
                p_id : ID of the project
        '''
        c = self.conn.cursor()
        f_query = q.IMAGES_WITH_LABELS
        result = c.execute(f_query, (p_id,)).fetchall()
        return [image[0] for image in result]
    
    def get_image(self, i_id) :
        '''
            Returns the image given its image id
            
            Args:
                i_id : ID of the image
        '''
        c = self.conn.cursor()
        return c.execute(q.filter_query('*', 'image', 'id'), (i_id,)).fetchone()

    def update_image_status(self, i_id) :
        '''
            Change the image's labelled value to 1
            
            Args:
                i_id : ID of the image
        '''
        c = self.conn.cursor()
        c.execute(q.update_query('image', 'labelled', 'id'), (1, i_id))
        self.conn.commit()

    def add_label(self, label, project_id):
        '''
            Adds a label to the database given the project id

            Args:
                label : name of the label
                project_id: ID of the project
        '''

        c = self.conn.cursor()

        # Add project to table
        c.execute(q.insert_query('label'), (label, project_id))

        self.conn.commit()
        

    def del_label(self, label):
        '''
            Deletes an existing label

            Args:
                label: dictionary containinig label's id.
        '''

        c = self.conn.cursor()

        # Delete entries as required
        iid = (label["id"], )
        c.execute(q.del_query('region','label_id'), iid)
        c.execute(q.del_query('label', 'id'), iid)
        self.conn.commit()
        
    
        
    def get_label(self, label_id, project_id):
        '''
            Return an existing label

            Args:
                label_id : ID of the label
                project_id : ID of the project
        '''

        c = self.conn.cursor()
        f_query = q.double_filter_query('*', 'label', 'id','project_id')
        return c.execute(f_query, (label_id,project_id)).fetchone()
    

    def get_regions(self, img_id):
        '''
            Gets the regions of an image.

            Args:
                img_id: ID of specified image.
        '''

        c = self.conn.cursor()

        i_query = "SELECT region.id, region.image_id, label.text, region.x0, region.x1, region.y0, region.y1, region.type, region.conf \
            FROM region INNER JOIN label on label.id == region.label_id WHERE image_id = ? AND type = ?"
        return c.execute(i_query, (img_id, "human")).fetchall()
    
    def get_predictions(self, img_id):
        '''
            Get predictions for a particular image
            
            Args:
                img_id : ID of specified image
        '''
        c = self.conn.cursor()
        i_query = "SELECT region.id, region.image_id, label.text, region.x0, region.x1, region.y0, region.y1, region.type, region.conf \
            FROM region INNER JOIN label on label.id == region.label_id WHERE image_id = ? AND type = ?"
        
        return c.execute(i_query, (img_id, "pred")).fetchall()

    def update_regions(self, p_id, img_id, regions):
        '''
            Deletes and then adds the regions for an image.

            Args:
                img_id: ID of specified image.
                regions: updated regions
        '''
        c = self.conn.cursor()
        # Drop existing regions for this image
        d_query = "DELETE FROM region WHERE region.image_id = ? AND region.type = ?"
        c.execute(d_query, (img_id,"human"))
        regions = self.preprocess_regions(regions, p_id)
        # Insert new regions for this image
        i_query = q.insert_query('region')
        values = [(img_id, r["label"], r['x0'], r['x1'], r['y0'], r['y1'],"human", 1.0, p_id)
                  for r in regions]
        c.executemany(i_query, values)
        self.conn.commit()
    
    def del_predictions(self, p_id):
        '''
            Delete all predictions in a project

            Args:
                p_id: ID of the project
        '''
        c = self.conn.cursor()
        # Drop existing regions for this image
        d_query = q.del_query('region', 'project_id')
        d_query = "DELETE FROM region WHERE region.project_id = ? AND region.type = ?"
        c.execute(d_query, (p_id,"pred"))
        
    def add_predictions(self, p_id, img_id, predictions):
        '''
            Add predictions to an image

            Args:
                p_id: ID of the project
                img_id: ID of the image
                predictions: list of predictions
        '''
        c = self.conn.cursor()
        values = [(img_id, r["label"], r["x0"], r["x1"], r["y0"], r["y1"], "pred", r["conf"], str(p_id))
                  for r in predictions]
        d_query = q.insert_query('region')
        c.executemany(d_query, values)
        self.conn.commit()
            
    def preprocess_regions(self, regions, project_id):
        '''
        Check if the regions given are valid
        
        Args:
            regions : regions to add
            project_id : ID of the project
        '''
        labels = self.get_classes(project_id)
        for i, region in enumerate(regions):
            valid = False
            if not region["label"].isdigit():
                for label in labels:
                    if label[1]==region["label"]:
                        region["label"]=label[0]
                        valid = True
                        break
                if not valid :
                    regions.pop(i)
        return regions
                
    def confirm_regions(self, i_id):
        '''
        Delete all predictions in the image and move the image to the training set
        
        Args:
            i_id : ID of the image
        '''
        c = self.conn.cursor()

        d_query = "DELETE FROM region WHERE region.image_id = ? AND region.type = ?"
        c.execute(d_query, (i_id,'pred'))

        u_query = q.update_query('image', 'dset', 'id')
        c.execute(u_query, ('train', i_id,))

        self.conn.commit()

    def get_project_regions(self, project_id):
        '''
            Get all regions for a given project.

            Args:
                project_id: Integer ID of the project.
        '''

        c = self.conn.cursor()

        i_query = q.PROJECT_REGIONS
        return c.execute(i_query, (project_id,)).fetchall()
    
    def get_classes(self, project_id):
        '''
            Get all class names for a projec
            
            Args:
                project_id : ID of the project
        '''
        c = self.conn.cursor()

        s_query = q.PROJECT_CLASSES
        return c.execute(s_query, (project_id,)).fetchall()
    
    def read_next_image_id(self) -> str:
        '''
        Hash function to generate unique identifier to an image
        '''
        return str(uuid4())
        

        

