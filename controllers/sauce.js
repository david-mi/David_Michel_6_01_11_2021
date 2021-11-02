const Sauce = require('../models/Sauce');
const fs = require('fs');

// fonction pour parser une cible définie
const parseSauce = target => JSON.parse(target);

exports.getAllSauces = (req, res, next) =>{
  Sauce.find()
		.then(sauces => res.status(200).json( sauces ))
		.catch(err => res.status(404).json({ err }))	
}

exports.getOneSauce = (req, res, next) =>{
	Sauce.findOne({
		_id: req.params.id
	})
		.then(sauce => res.status(200).json(sauce))
		.catch(err => res.status(404).json({ err }));
}

exports.deleteOneSauce = (req, res, next) =>{
	Sauce.findOne({ _id: req.params.id })
		.then(sauce =>{
			console.log(console.log(`Sauce imageUrl avant le split ${sauce.imageUrl} \n//////`))
			const filename = sauce.imageUrl.split('/images/')[1];
			console.log(`Sauce imageUrl après le split ${filename}`)
			fs.unlink(`images/${filename}`, ()=>{
				Sauce.deleteOne({ _id: req.params.id })
					.then(() => res.status(201).json({ message: "Sauce supprimée" }))
					.catch(err => res.status(400).json({ error }));
			})
		})
}

// mettre à jour une sauce avec son image

exports.updateOneSauce = (req, res, next) =>{

	/// on regarde si l'objet sauce existe dans la requête
	/// si oui ça veut dire qu'on souhaite changer l'image
	if (req.body.sauce){
		const updatedSauce = new Sauce({
		...parseSauce(req.body.sauce),
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		_id: req.params.id
	})
	Sauce.updateOne({_id: req.params.id},updatedSauce)
		.then(() => {
			res.status(201).json( {message: "Objet modifié"} )
		})
		.catch((err) => res.status(400).json({ err }));

	/// si l'objet sauce n'est pas trouvé dans la requête
	// ça veut dire que les informations se trouve directement dans
	// le body et qu'on ne souhaite pas changer l'image	
	}else{
		console.log(req.body.sauce)
		Sauce.updateOne({_id: req.params.id}, {
			...req.body,
			_id: req.params.id
		}
			 )
		.then(() => res.status(201).json({ message: "Objet modifié" }))
		.catch((err) => res.status(400).json({ err }));
	}
	
}


// console.log(`Id de req.params.id ${req.params.id}`)
// console.log(`req.params ${req.params}`)
// console.log('//////////')
// console.log(updatedSauce)


/// mettre à jour une sauce sans changer d'image

// exports.updateOneSauce = (req, res, next) =>{
// 	console.log(req.body.sauce)
// 		Sauce.updateOne({_id: req.params.id}, {
// 			...req.body.sauce,
// 			_id: req.params.id
// 		}
// 			 )
// 		.then(() => res.status(201).json({ message: "Objet modifié" }))
// 		.catch((err) => res.status(400).json({ err }));
// }

exports.addSauce = (req, res, next) => {
	// const sauceObject = JSON.parse(req.body.sauce);
  	const sauce = new Sauce({
    ...parseSauce(req.body.sauce),
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
		likes: 0,        
    dislikes: 0,        
    usersLiked: [],        
    usersDisliked: [],  

  })

  sauce.save()
		.then(() => res.status(201).json({ Message: "Sauce Créé" }))
		.catch(err => res.status(400).json({ err }))

}