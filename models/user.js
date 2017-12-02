module.exports = function(sequelize, DataType){
	var Users = sequelize.define("Users", {
		name: DataType.STRING,
		email:DataType.STRING,
		password:DataType.STRING,
		image: {
			type: DataType.STRING,
			defaultValue: "images/defaultAvatar.png",
		},
		teamName: DataType.STRING,
		teamMembers: DataType.STRING,
		score: {
			type:DataType.INTEGER,
			defaultValue:0
		},
		latestScore: {
			type:DataType.INTEGER,
			defaultValue:0
		}
	});
	return Users;
};