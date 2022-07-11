// const multipart = require('fastify-multipart');
// node 16
// fastify.register(require('@fastify/multipart'))



// const concat = require('concat-stream')
//  not used for node 14+ 
const pump = require('pump')
const fs = require('fs-extra')
const drive = process.env.drive;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
//https://github.com/fastify/fastify/blob/master/docs/Request.md
module.exports = async function (fastify, opts, next) {
    //14  fastify.register(require('fastify-multipart'))
    fastify.register(require('@fastify/multipart'), {
        limits: {
            //         fieldNameSize: 100, // Max field name size in bytes
            //         fieldSize: 100, // Max field value size in bytes
            //         fields: 10,         // Max number of non-file fields
            fileSize: 50000000,      // 30000000 For multipart forms, the max file size 100 = 10 megs
            //         files: 1,           // Max number of file fields
            //         headerPairs: 2000   // Max number of header key=>value pairs
        }
    });

    // fastify.post('/upload/:dir/:wcid/:id', (req, reply) => {
    fastify.post('/:dir/:wcid/:id', (req, reply) => {

        // path  //D:\Docs\Images\claims\70000(wcid)\payments(dir)\(id)1004078.pdf
        let uploaded = false
        const { dir, wcid, id } = req.params;
        console.log('============================req=/n/r', dir, wcid, id)//req.headers,req.params )
        const mp = req.multipart(handler, onEnd)
        // mp is an instance of https://www.npmjs.com/package/busboy
        //D:\Docs\Images\claims\70000\payments\1004078.pdf -

        let dirval = dir//'po'// ${dirval} 0
        // check if directory exits passed as part of form
        mp.on('field', function (key, value) {
            dirval = value;

            // let pathcheck = `${drive}:/Docs/images/claims/${dirval}/{id}`
            let pathcheck
            let dirpath
            if (dirval === 'payee') {
                // wcid is payeeid
                pathcheck = `${drive}:/Docs/images/payee/${wcid}`
                dirpath = `${drive}:/Docs/Images/payee/${wcid}`  // /${id}`

            } else {
                pathcheck = `${drive}:/Docs/images/claims/${dirval}/${id}`
                dirpath = `${drive}:/Docs/Images/claims/${wcid}/${dirval}`
            }


            fs.ensureDir(pathcheck)
                .then(() => {

                })
                .catch(err => {
                    console.error(err)
                })
        })
        function onEnd(err) {
            console.log('upload completed')
            // reply.code(200).send()
            reply.send({data:'upload'})
        }
        async function createdir(directory) {
            try {
                await fs.ensureDir(directory)
                console.log('success! ', directory)
            } catch (err) {
                console.error(err)
            }
            return true 
        }
        async function handler(field, file, filename, encoding, mimetype) {
            // pump(file, fs.createWriteStream(`./uploads/${dirval}/${filename}`))
            // console.log(`=========handler-----------e:/Docs/images/claims/${wcid}/${dirval}/${filename}`, file, filename)

          
            // if (dirval === 'payee') {
            //     //   url = `${this.base}upload/${type}/${rec.wcid}/${rec.docid}`
            //     // wcid is payeeid
            //     dirpath = `${drive}:/Docs/Images/payee/${wcid}`  // /${id}`
            // } else {
            //     dirpath = `${drive}:/Docs/Images/claims/${wcid}/${dirval}`
            // }


            console.log(`=========handler---dirpath/filename--------${dirpath}/${filename}`, id, file, filename)
            let cd = await createdir(dirpath)
         
            // let writepath = `e:/Docs/Images/claims/${wcid}/${dirval}/${filename}`
            let writepath = `${dirpath}/${filename}`
             await sleep(1500)
        
            pump(file, fs.createWriteStream(writepath)) //replaced with  var file = fs.createWriteStream(writepath);
            console.log(`upload writepath ${writepath}`)
        
            // var file = fs.createWriteStream(writepath);


            uploaded = true
            console.log(`upload pump ${filename}`)
            const dstpath = `${dirpath}/${id}.pdf`
            try {
                //await
                fs.rename(writepath, dstpath)
                console.log('rename success!', writepath, dstpath)
            } catch (err) {
                console.error('3', err)
            }

            // be careful of permission issues on disk and not overwrite ${dirval}
            // sensitive files that could cause security risks
        }

        // reply.send({data:'upload'})
    })



    fastify.post('/', (req, reply) => {

        console.log('========upload====================', req.headers)
            let uploaded = false
            const mp = req.multipart(handler, onEnd)
            // mp is an instance of https://www.npmjs.com/package/busboy
            let dirval = 0
            // check if directory exits passed as part of form
            mp.on('field', function (key, value) {
                dirval = value;
                let pathcheck = `./uploads/${dirval}`
                fs.ensureDir(pathcheck)
                    .then(() => {
                    })
                    .catch(err => {
                        console.error(err)
                    })
            })
            function onEnd(err) {
                console.log('upload completed')
                // reply.code(200).send()
                reply.send({data:'upload'})
            }
            function handler(field, file, filename, encoding, mimetype) {
                pump(file, fs.createWriteStream(`${drive}:/clientuploads/${filename}`))
                // var file = fs.createWriteStream(`${drive}:/clientuploads/${filename}`)
                uploaded = true
                console.log('upload pump')
                // be careful of permission issues on disk and not overwrite ${dirval}
                // sensitive files that could cause security risks
            }
     
        next()
        
       
    })
    
}

module.exports.autoPrefix = '/upload'