import {
    SESClient,
    SendEmailCommand,
} from "@aws-sdk/client-ses";

interface Todo {
    title: string;
    description?: string;
    completed: boolean;
}

interface SendEmailBody {
    to: string;
    todos: Todo[];
}

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
});

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as SendEmailBody;

        const { to, todos } = body;

        if (!to || !Array.isArray(todos)) {
            return Response.json(
                {
                    message: "Faltan datos para enviar el correo",
                },
                { status: 400 }
            );
        }

        const completedTasks = todos.filter(
            (todo) => todo.completed
        ).length;

        const pendingTasks = todos.filter(
            (todo) => !todo.completed
        ).length;

        const totalTasks = todos.length;

        const taskList =
            todos.length > 0
                ? todos
                    .map(
                        (todo) =>
                            `- ${todo.completed ? "[COMPLETADA]" : "[PENDIENTE]"} ${todo.title}`
                    )
                    .join("\n")
                : "No hay tareas registradas.";

        const message = `
Resumen de tareas - MateCode

Total de tareas: ${totalTasks}
Tareas completadas: ${completedTasks}
Tareas pendientes: ${pendingTasks}

Detalle:

${taskList}
`;

        const command = new SendEmailCommand({
            Source: process.env.AWS_SES_FROM_EMAIL,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: "Resumen de tareas - MateCode",
                    Charset: "UTF-8",
                },
                Body: {
                    Text: {
                        Data: message,
                        Charset: "UTF-8",
                    },
                },
            },
        });

        await sesClient.send(command);

        return Response.json(
            {
                message: "Correo enviado correctamente",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error al enviar el correo:", error);

        return Response.json(
            {
                message: "No se pudo enviar el correo",
            },
            { status: 500 }
        );
    }
}