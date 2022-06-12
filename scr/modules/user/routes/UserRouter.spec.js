const LoginRouter = require('./login-router')

const { MissingParamError, 
        InvalidParamError, 
        UnauthorizedError, 
        ServerError } = require('../../../config/constants/errors')
        


const makeSut = () => {
  const  authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  authUseCaseSpy.accessToken = 'valid_token'
  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid ( email )  {
      this.email = email
      return this.isEmailValid
    }
  }
    const emailValidatorSpy = new EmailValidatorSpy()
    emailValidatorSpy.isEmailValid = true
    return emailValidatorSpy
  }

  const emailValidatorWithError = () => {
    class EmailValidatorSpy {
      isValid () {
        throw new Error()
      }
    } 
    return new EmailValidatorSpy()
  } 
  

  const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  } 
  return new AuthUseCaseSpy()
} 

describe('Login Router Auth', () => {
    test('Deve retornar 400 se nenhum e-mail for fornecido', async  () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                password: 'any_password'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))        
      })

      test('Deve retornar 400 se nenhum password for fornecido', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new MissingParamError('password'))   
      })

      test('Deve retornar 500 se nenhum httpRequest for fornecido', async() => {
        const { sut } = makeSut()
        const httpResponse = await sut.route()
        expect(httpResponse.statusCode).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve retornar 500 se nenhum httpRequest for fornecido no body', async() => {
        const { sut } = makeSut()
        const httpRequest = {}
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve chamar AuthUseCase com parâmetros corretos', async () => {
        const { sut, authUseCaseSpy } = makeSut()
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
      }
       await sut.route(httpRequest)
       expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
       expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
      })

      test('Deve retornar 401 quando credenciais inválidas são fornecidas', async () => {
        const { sut, authUseCaseSpy } = makeSut()
        authUseCaseSpy.accessToken = null
        const httpRequest = {
          body: {
            email: 'invalide_email@mail.com',
            password: 'invalide_password'

        }
      }
       const httpResponse = await sut.route(httpRequest)
       expect(httpResponse.statusCode).toBe(401);
       expect(httpResponse.body).toEqual(new UnauthorizedError())
      })


      test('Deve retornar 200 quando credenciais validas são fornecidas', async () => {
        const { sut, authUseCaseSpy } = makeSut()
        const httpRequest = {
          body: {
            email: 'valide_email@mail.com',
            password: 'valide_password'
        }
      }
       const httpResponse = await sut.route(httpRequest)
       expect(httpResponse.statusCode).toBe(200);
       expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken);
       
       
      })



      test('Deve retornar 500 se AuthUserCase não for provido', async () => {
        const sut = new LoginRouter()
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
      }
       const httpResponse = await sut.route(httpRequest)
       expect(httpResponse.statusCode).toBe(500)
       expect(httpResponse.body).toEqual(new ServerError())   
      })

      
      test('Deve retornar 500 se nenhum AuthUserCase for fornecido no body', async () => {
        const sut = new LoginRouter({})
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve retornar 500 se AuthUserCase thorows', async () => {
        const authUseCaseSpy = makeAuthUseCaseWithError()         
        const sut = new LoginRouter(authUseCaseSpy)
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve retornar 400 se o email for invalido', async () => {
        const { sut, emailValidatorSpy } = makeSut()
        emailValidatorSpy.isEmailValid = false
        const httpRequest = {
            body: {
                email: 'invalid_email@mail.com',
                password: 'any_email@mail.com'
            }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(400);
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))   
      })

      test('Deve retornar 500 se EmailValidator não for provido', async () => {
        const sut = new LoginRouter()
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
      }
       const httpResponse = await sut.route(httpRequest)
       expect(httpResponse.statusCode).toBe(500)
       expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve retornar 500 se EmailValidator é metodo invalido', async () => {
        const authUseCaseSpy = makeAuthUseCase()
        const sut = new LoginRouter(authUseCaseSpy, {})
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
      }
       const httpResponse = await sut.route(httpRequest)
       expect(httpResponse.statusCode).toBe(500)
       expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve retornar 500 se EmailValidator for lançado error exceção', async () => {
        const authUseCaseSpy = makeAuthUseCase()
        const sut = new LoginRouter(authUseCaseSpy, {})
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
      }
       const httpResponse = await sut.route(httpRequest)
       expect(httpResponse.statusCode).toBe(500)
       expect(httpResponse.body).toEqual(new ServerError())   
      })

      test('Deve chamar EmailValidator com email corretos', async () => {
        const { sut, emailValidatorSpy } = makeSut()
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
        }
      }
       await sut.route(httpRequest)
       expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
      })
})