import { Request, Response } from 'express'
import UsersRepository from '../repositories/UsersRepository'
import SurveysRepository from '../repositories/SurveysRepository'
import SurveysUsersRepository from '../repositories/SurveysUsersRepository'
import { getCustomRepository } from 'typeorm'
import SendMailService from '../services/SendMailService'
import path from 'path'

export default class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body

    const usersRepository = getCustomRepository(UsersRepository)
    const surveysRepository = getCustomRepository(SurveysRepository)
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository)

    

    const user = await usersRepository.findOne({ email })

    if(!user) {
      return response.status(400).json({
        erro: 'User does not exist!'
      })
    }

    const survey = await surveysRepository.findOne({ id: survey_id })

    if(!survey) {
      return response.status(400).json({
        erro: 'Survey does not exist!'
      })
    }

    const npsPath = path.resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs')

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      user_id: user.id,
      link: process.env.URL_MAIL
    }

    const surveyUserAlreadyExist = await surveysUsersRepository.findOne({
      where: [{user_id: user.id}, {value: null}],
      relations: ['user', 'survey'],
    })

    if(surveyUserAlreadyExist) {
      await SendMailService.execute(email, survey.title, variables, npsPath)
      return response.json(surveyUserAlreadyExist)
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    })

    
    await surveysUsersRepository.save(surveyUser)    

    await SendMailService.execute(email, survey.title, variables, npsPath)

    return response.json(surveyUser)
  }
}