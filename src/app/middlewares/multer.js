const multer = require('multer');
const path = require('path');
const crypto = require('crypto');



const multerConfig = {
  dest: path.resolve(__dirname,  "..", "..", "..", "tmp", "profile"),
    storage: multer.diskStorage({
        
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname,  "..", "..", "..", "tmp", "profile"));
        },
        filename: async (req, file, cb) => {
            await crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);
                
                const fileName = `${hash.toString("hex")}-${file.originalname}`;

                cb(null, fileName);
            });
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg','image/pjpeg','image/png','image/gif'];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('invalid file type.'));
        }
    },
}

const upload = multer(multerConfig).single('file')

module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      
      console.log(err)
      return res.json({error: 'ahhhh'})
    } else if (err) {
      
      console.log(err)
      return res.json({error: 'ahhhh'})
    }
    next()
    
  })
  
}

/*module.exports = {
    dest: path.resolve(__dirname,  "..", "..", "..", "tmp", "profile"),
    storage: multer.diskStorage({
        
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname,  "..", "..", "..", "tmp", "profile"));
        },
        filename: async (req, file, cb) => {
            await crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);
                
                const fileName = `${hash.toString("hex")}-${file.originalname}`;

                cb(null, fileName);
            });
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg','image/pjpeg','image/png','image/gif'];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('invalid file type.'));
        }
    },
}*/