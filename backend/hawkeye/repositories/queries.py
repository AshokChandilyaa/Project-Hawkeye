SCHEMA = {
    'project': (
        ('id', 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT'),
        ('name', 'TEXT NOT NULL')
    ),
    'image': (
        ('id', 'TEXT NOT NULL PRIMARY KEY'),
        ('width', 'INTEGER NOT NULL'),
        ('height', 'INTEGER NOT NULL'),
        ('project_id', 'INTEGER NOT NULL'),
        ('dset', 'TEXT NOT NULL'),
        ('labelled', 'BIT NOT NULL'),
        ('FOREIGN KEY', '(project_id) REFERENCES project(id)')
    ),
    'label': (
        ('id', 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT'),
        ('text', 'TEXT NOT NULL'),
        ('project_id', 'INTEGER NOT NULL'),
        ('FOREIGN KEY', '(project_id) REFERENCES project(id)')
    ),
    'region': (
        ('id', 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT'),
        ('image_id', 'TEXT NOT NULL'),
        ('label_id', 'INTEGER NOT NULL'),
        ('x0', 'REAL NOT NULL'),
        ('x1', 'REAL NOT NULL'),
        ('y0', 'REAL NOT NULL'),
        ('y1', 'REAL NOT NULL'),
        ('type', 'TEXT NOT NULL'),
        ('conf', 'REAL NOT NULL'),
        ('project_id', 'INTEGER NOT NULL'),
        ('FOREIGN KEY', '(image_id) REFERENCES image(id)'),
        ('FOREIGN KEY', '(label_id) REFERENCES label(id)'),
        ('FOREIGN KEY', '(project_id) REFERENCES project(id)')
    )
}


def get_cols(table):
    return [x[0] for x in SCHEMA[table] if x[0] != 'FOREIGN KEY']


def build_table(table):
    q = 'CREATE TABLE IF NOT EXISTS %s (' % table
    for attribute in SCHEMA[table]:
        q += '%s %s, ' % attribute
    # [-2] removes the extra space and comma
    return q[:-2] + ');'


def build_query(q, cols):
    for c in cols:
        q += "%s, " % c
    # [-2] removes the extra space and comma
    q = q[:-2] + ') VALUES (' + '?, '*len(cols)
    return q[:-2] + ');'


def insert_query(table, id_=False):
    cols = get_cols(table) if id_ else get_cols(table)[1:]
    q = 'INSERT INTO ' + table + ' ('
    return build_query(q, cols)


def del_query(table, col):
    q = 'DELETE FROM ' + table + ' WHERE ' + col + ' = ?'
    return q


def filter_query(col1, table, col2):
    q = 'SELECT ' + col1 + ' FROM ' + table + ' WHERE ' + col2 + ' = ?'
    return q


def double_filter_query(col1, table, col2, col3):
    q = 'SELECT ' + col1 + ' FROM ' + table + ' WHERE ' + col2 + ' = ? AND ' + col3 + ' = ?'
    return q


def update_query(table, col1, col2):
    q = 'UPDATE ' + table + ' SET ' + col1 + ' = ? WHERE ' + col2 + ' = ?'
    return q


ALL_PROJECTS = ''' SELECT * from project '''

CREATE_TABLES = [build_table(t) for t in SCHEMA]

PROJECT_REGIONS = '''
                    SELECT r.image_id, x0, y0, x1, y1, type, conf, i.width, i.height
                    FROM region r
                    INNER JOIN image i on r.image_id = i.id
                    INNER JOIN project on i.project_id = project.id
                    WHERE project.project_id = ? ;
                  '''

PROJECT_CLASSES = '''
                    SELECT *
                    FROM label l
                    INNER JOIN project on l.project_id = project.id
                    WHERE project.id = ? ;
                  '''

IMAGES_WITH_LABELS = '''
                        SELECT image.id
                        FROM image
                        WHERE image.project_id = ? AND image.labelled == 1 ;
                     '''