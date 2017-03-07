/**
 * commandParser.service.ts
 *
 * @authors Pierre To et Mikael Ferland
 * @date 2017/03/05
 */

export enum CommandType {
    PLACER,
    CHANGER,
    PASSER,
    AIDE
}

export enum CommandStatus {
    UNDEFINED_COMMAND, // command does not exist (see EXISTING_COMMAND)
    INVALID_COMMAND_SYNTAX, // command does not have proper syntax
    VALID_COMMAND
}

export interface Command {
    msg: string;
    commandType: CommandType;
    commandStatus: CommandStatus;
}

export class CommandParser {
    private readonly EXISTING_COMMANDS = ["!placer", "!changer", "!passer", "!aide"];
    private readonly PLACE_LETTER_REGEX = /^(!placer)\s[a-oA-O](10|11|12|13|14|15|[1-9])[h|H|v|V]\s[a-zA-Z]{1,7}$/;
    private readonly CHANGE_LETTER_REGEX = /^(!changer)\s([a-z]|[*]){1,7}$/;
    private readonly SKIP_TURN_REGEX = /^(!passer)$/;
    private readonly HELP_REGEX = /^(!aide)$/;

    isACommand(msg: string): boolean {
        let trimMsg = msg.trim();

        // A command should always start with "!"
        return (trimMsg[0] === '!');
    }

    createCommand(msg: string): Command {
        // A command contains a message, a type and a status
        msg = msg.trim();

        let commandType = msg.split(' ', 1)[0];
        let commandTypeIndex = this.EXISTING_COMMANDS.findIndex(existingCommand => existingCommand === commandType);

        let commandStatus = this.validateCommand(msg, commandTypeIndex);

        return { msg: msg, commandType: commandTypeIndex, commandStatus: commandStatus };
    }

    private validateCommand(msg: string, commandType: CommandType): CommandStatus {
        let validSyntax = false;

        switch (commandType) {
            case CommandType.PLACER :
                validSyntax = this.validatePlaceLetterSyntax(msg);
                break;
            case CommandType.CHANGER :
                validSyntax = this.validateChangeLetterSyntax(msg);
                break;
            case CommandType.PASSER :
                validSyntax = this.validateSkipTurnSyntax(msg);
                break;
            case CommandType.AIDE :
                validSyntax = this.validateHelpSyntax(msg);
                break;
            default : // command was not found
                return CommandStatus.UNDEFINED_COMMAND;
        }

        return (validSyntax) ? CommandStatus.VALID_COMMAND : CommandStatus.INVALID_COMMAND_SYNTAX;
    }

    private validatePlaceLetterSyntax(msg: string): boolean {
        return this.PLACE_LETTER_REGEX.test(msg);
    }

    private validateChangeLetterSyntax(msg: string): boolean {
        return this.CHANGE_LETTER_REGEX.test(msg);
    }

    private validateSkipTurnSyntax(msg: string): boolean {
        return this.SKIP_TURN_REGEX.test(msg);
    }

    private validateHelpSyntax(msg: string): boolean {
        return this.HELP_REGEX.test(msg);
    }
}