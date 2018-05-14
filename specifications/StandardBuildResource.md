# Specification for a Standard Build Resource (SBR)

# r.name
    The name of the resource. This will be the default file name when output.

# r.ext
    The file type extension of the resource. This determines how the resource is treated by transforms, parsers, and plugins.

# r.dest
    The full path of the destination directory

# r.src
    Array of source files to be concatenated together to create the initial contents of this resource

# r.options
    ## r.options.srcDir
    ## r.options.outputDir
    ## r.options.clean

# r.chain
    Array of plugins to be executed on the resources when the build is run

# r.contents
    An object used to get/set resource contents

## r.contents.getString()
    Returns the current contents of the resource as a string

## r.contents.getHash()
    Returns a unique hash that represents the current contents of the resource

## r.contents.set(contents)
    Overwrite the old contents with new contents

# r.sourcemaps
    Array of source mappings to explain from where in each source file the contents of this resource originated
