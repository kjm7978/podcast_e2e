import { Episode } from './../src/podcast/entities/episode.entity';
import { Podcast } from './../src/podcast/entities/podcast.entity';
import { Query } from '@nestjs/graphql';
import { UserProfileInput } from './../src/users/dtos/user-profile.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';


const GRAPHQL_ENDPOINT = '/graphql';

const testUser ={
  email : "test@gamil.com",
  password : "12345",
}

const testPodcast ={
  titile : "test pocast",
  category : "test",
}

const testEpisode ={
  titile : "test episodeg",
  category : "epic",
}

const podcastId = 1;
const episodeId = 1;

describe('App (e2e)', () => {
  let app: INestApplication;
  let usersRepository : Repository<User>
  let podcastRepository: Repository<Podcast>;
  let episodeRepository: Repository<Episode>;
  let jwtToken:string;
  
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    podcastRepository = module.get<Repository<Podcast>>(
      getRepositoryToken(Podcast),
    );
    episodeRepository = module.get<Repository<Episode>>(
      getRepositoryToken(Episode),
    );
    await app.init();
  });

  afterAll(async()=>{
    await getConnection().dropDatabase()
    app.close();
  })

  describe('Podcasts Resolver', () => {
    describe('getAllPodcasts',()=>{
      it("should get all podcasts",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            query{
              getAllPodcasts {
                ok
                error
                podcasts {
                  id
                }
              }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{getAllPodcasts:{
                    ok,
                    error,
                    podcasts:{id},
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })
    });

    describe('createPodcast',()=>{
      it("should create podcast",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              createPodcast(
                input:{title:"${testPodcast.titile}",category:"${testPodcast.category}"})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{createPodcast:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })
    });

    describe('getPodcast',()=>{
      it("should get podcast",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            query{
              getPodcast(input:{id:${podcastId}}){
                ok
                error
                podcast {
                  id
                }
              }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{getPodcast:{
                    ok,
                    error,
                    podcast,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })
      it("should fail if podcast(id) not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            query{
              getPodcast(input:{id:777}){
                ok
                error
                podcast {
                  id
                }
              }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{getPodcast:{
                    ok,
                    error,
                    podcast,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })
    });

    describe('updatePodcast',()=>{
      it("should update podcast",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              updatePodcast(
                input:{id:${podcastId},payload:{title:"update title"}})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{updatePodcast:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })
      it("should fail if podcast is not found",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              updatePodcast(
                input:{id: 777,payload:{title:"update title"}})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{updatePodcast:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })
    });

    describe('createEpisode',()=>{
      it("should create episode",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              createEpisode(
                input:{ podcastId: ${podcastId}, title:"${testEpisode.titile}",category:"${testEpisode.category}"})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{createEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })

      it("should not create episode if podcast is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              createEpisode(
                input:{ podcastId: 777, title:"${testEpisode.titile}",category:"${testEpisode.category}"})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{createEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })
    });

    describe('getEpisodes',()=>{
      it("should get episodes",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            query{
              getEpisodes(input:{ id: ${podcastId}})
              {
                  ok
                  error
              }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{getEpisodes:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })

      it("should fail get episodes if podcastID is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            query{
              getEpisodes(input:{ id: 777})
              {
                  ok
                  error
              }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{getEpisodes:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })
    });

    describe('updateEpisode',()=>{
      it("should update episode",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              updateEpisode(
                input:{podcastId:${podcastId},episodeId: ${episodeId}, title:"episode update"})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{updateEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })

      it("should fail update episode if podcast is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              updateEpisode(
                input:{podcastId:777,episodeId: ${episodeId}, title:"episode update"})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{updateEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })


      it("should fail update episode if episode is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              updateEpisode(
                input:{podcastId:${podcastId},episodeId: 777, title:"episode update"})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{updateEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Episode with id 777 not found in podcast with id 1")
          })
      })
    });

        
    describe('deleteEpisode',()=>{
      it("should delete episode",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              deleteEpisode(
                input:{podcastId:${podcastId},episodeId: ${episodeId}})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{deleteEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })

      it("should fail delete episode if podcast is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              deleteEpisode(
                input:{podcastId:777,episodeId: ${episodeId}})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{deleteEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })

      it("should fail delete episode if podcast is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              deleteEpisode(
                input:{podcastId:${podcastId},episodeId: 777})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{deleteEpisode:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Episode with id 777 not found in podcast with id 1")
          })
      })

    });
    
    describe('deletePodcast',()=>{
      it("should delete podcast",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              deletePodcast(
                input:{id:${podcastId}})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{deletePodcast:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null)
          })
      })

      it("should fail delete podcast if podcast is not exist",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              deletePodcast(
                input:{id:777})
                {
                  ok
                  error
               }
            }
          `})
          .expect(200)
          .expect(res=>{
            const {
              body:{
                data:{deletePodcast:{
                    ok,
                    error,
                }},
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe("Podcast with id 777 not found")
          })
      })
    });



  });
  describe('Users Resolver', () => {

    describe('createAccount', ()=>{
      
      it("should create account", ()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              createAccount(input:{
                email: "${testUser.email}",
                password : "${testUser.password}",
                role : Host
              }){
                ok
                error
              }
            }
          `})
          .expect(200)
          .expect(res=>{
            expect(res.body.data.createAccount.ok).toBe(true);
            expect(res.body.data.createAccount.error).toBe(null)
          })
      })

      it("should fail if account already exists",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              createAccount(input:{
                email: "${testUser.email}",
                password : "${testUser.password}",
                role : Host
              }){
                ok
                error
              }
            }
          `})
          .expect(200)
          .expect(res=>{

            expect(res.body.data.createAccount.ok).toBe(false);
            expect(res.body.data.createAccount.error).toEqual(expect.any(String))
          })
      })
    });

    describe('login',()=>{

      it("should login with correct credentials",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              login(input:{
                email: "${testUser.email}",
                password : "${testUser.password}",
              }){
                ok
                error
                token
              }
            }
        `})
        .expect(200)
        .expect(res=>{
          const {
            body:{
              data:{login},
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
      });

      it("should not be able to login with wrong credentials",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            mutation{
              login(input:{
                email: "${testUser.email}",
                password : "wrongpassword",
              }){
                ok
                error
                token
              }
            }
        `})
        .expect(200)
        .expect(res=>{
          const {
            body:{
              data:{login},
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toEqual(expect.any(String))
          expect(login.token).toBe(null);
        });
      });
    });


    describe('seeProfile',()=>{
      let userId: number;
      beforeAll(async ()=>{
        const [user] = await usersRepository.find();
        userId = user.id;
      })
      it("should see a user's profile",()=>{

        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set(`X-JWT`, jwtToken)
          .send({
          query:`
            {
              seeProfile(userId:${userId}){
                ok
                error
                user {
                  id
                  email
                }
              }
            }
        `})
        .expect(200)
        .expect(res=>{
          const {
            body:{
              data:{
                seeProfile:{
                  ok,
                  error,
                  user:{id},
                }
              }
            }
          } = res;
          expect(ok).toBe(true)
          expect(error).toBe(null)
          expect(id)
        })
        
      });

      it("should not find a user's profile",()=>{
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set(`X-JWT`, jwtToken)
          .send({
          query:`
            {
              seeProfile(userId:777){
                ok
                error
                user {
                  id
                  email
                }
              }
            }
        `})
        .expect(200)
        .expect(res=>{
          const {
            body:{
              data:{
                seeProfile:{
                  ok,
                  error,
                  user,
                }
              }
            }
          } = res;
          expect(ok).toBe(false)
          expect(error).toBe("User Not Found")
          expect(user).toBe(null)
        })
      })
    });
    
    describe('me',()=>{
      it("should find my profile",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set("X-JWT",jwtToken).send({
            query:`
              {
                me{
                  email
                }
              }
            `
        })
        .expect(200)
        .expect(res=>{
          const {body:{data:{me:{email}}}} = res;
          expect(email).toBe(testUser.email)
        })
      })

      it("should not allow logged out user",()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
          query:`
            {
              me{
                email
              }
            }
          `
        })
        .expect(200)
        .expect(res=>{
           const {
             body: {errors}
           } = res;
           const [error] = errors;
           expect(error.message).toBe('Forbidden resource');
          })
      })
    });


    describe('editProfile',()=>{
      const NEW_EMAIL = 'edit@gmail.com'

      it("should change email", ()=>{
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
        .set("X-JWT",jwtToken)
        .send({
          query : `
            mutation {
              editProfile(input:{
                email : "${NEW_EMAIL}"
              }){
                ok
                error
              }
            }
          `
        })
        .expect(200)
        .expect(res=>{
          const { body : {data:{editProfile:{ok,error}}}} = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        })
      })
      it("should have new email",()=>{
          return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).set("X-JWT",jwtToken).send({
                query:`
                  {
                    me{
                      email
                    }
                  }
                `
            })
            .expect(200)
            .expect(res=>{
              const {body:{data:{me:{email}}}} = res;
              expect(email).toBe(NEW_EMAIL)
            })
      })

    });

  });
});
