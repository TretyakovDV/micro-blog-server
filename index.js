const express = require('express');
const mongoose = require('mongoose')
require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors')
const { GraphQLObjectType, GraphQLSchema, GraphQLID, GraphQLString, GraphQLList } = require('graphql');

const PostSchema = new mongoose.Schema({
  title: String,
  body: String,
  image: String,
  author: String,
  date: {type: Date, default: Date.now()}
})

const PostModel = mongoose.model('Post', PostSchema)

const postType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: {type: GraphQLID},
    title: {type: GraphQLString},
    body: {type: GraphQLString},
    image: {type: GraphQLString},
    author: {type: GraphQLString},
    date: {type: GraphQLString},
  }
})

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    post: {
      type: postType,
      args: {
        id: {type: GraphQLID}
      },
      resolve: (_, {id}) => {
        return PostModel.findOne({_id: id})
      }
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: () => {
        return PostModel.find({})
      }
    }
  })
})

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addPost: {
      type: postType,
      args: {
        title: {type: GraphQLString},
        body: {type: GraphQLString},
        image: {type: GraphQLString},
        author: {type: GraphQLString},
        data: {type: GraphQLString},
      },
      resolve: async (_, { title, body, image, author, date}) => {
        const post = await PostModel.create({title, body, image, author, date})
        return post
      }
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: {type: GraphQLID}
      },
      resolve: async (_, {id}) => {
        await PostModel.findOneAndDelete({_id: id})
        return 'Success'
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
})

const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true});

app.listen(process.env.PORT || 8080);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
