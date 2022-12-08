import express, {Request, Response} from 'express'
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "./types";
import {CourseCreateModel} from "./models/CourseCreateModel";
import {CourseUpdateModel} from "./models/CourseUpdateModel";
import {CoursesGetQueryModel} from "./models/CourseGetQueryModel";
import {CourseViewModel} from "./models/CourseViewModel";
import {URIParamsCourseIdModel} from "./models/URIParamsCourseIdModel";

export const app = express()
const port = process.env.PORT || 5000

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    NOT_FOUND_404: 404,
    BAD_REQUEST_400: 400
}

app.use(express.json())

type CourseType = {
    id: number
    title: string
    studentsCount: number
}

const db : {courses: CourseType[]} = {
    courses: [
        {id: 1, title: 'front-end', studentsCount: 10},
        {id: 2, title: 'back-end', studentsCount: 10},
        {id: 3, title: 'automation qa', studentsCount: 10},
        {id: 4, title: 'devops', studentsCount: 10}
    ]
}

const getViewModel = (dbCourse: CourseType) : CourseViewModel => {
    return {
        id: dbCourse.id,
        title: dbCourse.title
    }
}

app.get('/courses', (req: RequestWithQuery<CoursesGetQueryModel>,
                     res: Response<CourseViewModel[]>) => {

    let foundCourses = db.courses

    if(req.query.title) {
        foundCourses = foundCourses
            .filter(c => c.title.indexOf(req.query.title as string) > -1)
    }

    res.json(foundCourses.map(getViewModel))
})

app.get('/courses/:id', (req: RequestWithParams<URIParamsCourseIdModel>, res: Response<CourseViewModel>) => {

    let found = db.courses.find(c => c.id === +req.params.id)

    if(!found) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    res.json(getViewModel(found))
})

app.post('/courses', (req: RequestWithBody<CourseCreateModel>,
                      res: Response<CourseViewModel>) => {

    if(!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }

    const createdCourse: CourseType = {
        id: +(new Date()),
        title: req.body.title,
        studentsCount: 0
    }

    db.courses.push(createdCourse)

    res.status(HTTP_STATUSES.CREATED_201).json(getViewModel(createdCourse))
})

app.delete('/courses/:id', (req: RequestWithParams<URIParamsCourseIdModel>, res) => {

    db.courses = db.courses.filter(c => c.id !== +req.params.id)

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.put('/courses/:id', (req: RequestWithParamsAndBody<URIParamsCourseIdModel, CourseUpdateModel>, res) => {

    if(!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }

    let found = db.courses.find(c => c.id === +req.params.id)

    if(!found) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    found.title = req.body.title

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.delete('/__test__/data', (req, res) => {
    db.courses = []
    res.sendStatus((HTTP_STATUSES.NO_CONTENT_204))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

module.exports = app
