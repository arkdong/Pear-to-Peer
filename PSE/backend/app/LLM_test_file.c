/*  Naam: Timon Jasarevic
    UvAnetID: 13432001
    Studie BSc Informatica
*/

/* Program function:
   Program analyses inputted values using Levensteihns algorithm
   by keeping track of the values in a modifiable global database.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_DB_SIZE 100
#define MAX_INPUT_SIZE 100

// Definition used in Levensteihns algorithm
#define MIN(X, Y) (((X) < (Y)) ? (X) : (Y))

// Global grid: database.
char **DATABASE;

// Amount of values stored in the database.
int DB_SIZE = 0;

/* Adds inputted value to database if there is no such value in it.
   It also prints out if the addition is done or why it fails.
   Function either returns an '1' if it was not added or '0' if it was added.
*/
int add(char *str) {
    for (int index = 0; index < DB_SIZE; index++){
        if (strcmp(str, DATABASE[index]) == 0){
            printf("\"%s\" not added; already in database\n", str);
            return 1;
        }
    }

    if (DB_SIZE == MAX_DB_SIZE) {
        printf("\"%s\" not added; database is full\n", str);
        return 1;
    }

    char* var = malloc((strlen(str)) * sizeof(char*));
    strcpy(var, str);
    DATABASE[DB_SIZE++] = var;

    printf("\"%s\" added to database\n", str);
    return 0;
}

// Function reads inputted file and adds the extracted values to the database.
// Function also handles faulty files.
void read(char *filename){
    FILE *file = fopen(filename, "r");
    if (file == NULL) {
        printf("\"%s\" not found \n", filename);
        return;
    }

    char line[MAX_INPUT_SIZE];
    while (fscanf(file, "%s", line) != EOF) {
        add(line);
    }
}

// Lists the values from the database if it is not empty.
void list(void){
    if (DB_SIZE > 0){
        printf("Entries in DATABASE:\n");
        for (int i = 0; i < DB_SIZE; i++){
            printf("%s\n", DATABASE[i]);
        }
    } else{
        printf("Database is empty \n");
    }
}

/* Deletes inputted value from database if it contains the same value.
   It then moves all the other values one index down
   to remove blank space in the database.
*/
void delete(char *str){

    int db_index = -1;
    for (int index = 0; index < DB_SIZE; index++) {
        if (strcmp(str, DATABASE[index]) == 0){
            db_index = index;
        }
    }

    if (db_index == -1){
        printf("%s not removed; not in database\n", str);
    }
    else {
        free(DATABASE[db_index]);

        for (int idx = db_index; idx <= DB_SIZE; idx++){
            DATABASE[idx] = DATABASE[idx + 1];
        }
        DB_SIZE--;

        printf("%s removed from database\n", str);
    }
}

// Free memory allocated for the inputted grid.
void clean_grid(int **grid, int rows){
    for (int i = 0; i <= rows; i++){
        free(grid[i]);
    }
    free(grid);
}

// Free memory allocated for the database.
void clean_db(void){
    for (int i = 0; i < DB_SIZE; i++){
        free(DATABASE[i]);
    }
    free(DATABASE);
}

/* The levensteihn algorithm takes two strings as input and calculates
   how much the strings resemble eachother, measured in integers.
   This is called the 'distance' and is determined by using a grid of integers.
   For more information on the algorithm, search on the internet.
*/

int **lvst(char *arg_1, char *arg_2){

    int rows = (int)strlen(arg_1);
    int cols = (int)strlen(arg_2);

    // Allocates memory for a grid. +1 because the edges of the grid
    // are not counted in the strings length.
    int **grid = malloc((size_t)(rows + 1) * sizeof(int*));
    for (int i = 0; i <= rows; i++){
        grid[i] = (int*) malloc((size_t)(cols + 1) * sizeof(int));
    }

    for (int y = 0; y <= rows; y++) {
        for (int x = 0; x <= cols; x++){
            grid[y][x] = 0;
        }
    }

    // Determines the Levensteihn distance grid.
    for (int row = 1; row <= rows; row++) {
        grid[row][0] = row;

        for (int col = 1; col <= cols; col++){
            grid[0][col] = col;

            if (arg_1[row - 1] == arg_2[col - 1]){
                grid[row][col] = grid[row - 1][col - 1];
            }
            else {
                int minimum = MIN((grid[row - 1][col] + 1),
                (grid[row][col- 1] + 1));

                grid[row][col] = MIN(minimum, (grid[row - 1][col - 1] + 1));
            }
        }
    }
    return grid;
}


// Compares two strings and displays the Levensteihn distance and grid.
// 'rows' and 'cols' are the dimensions of the Levensteihn grid.
void compare(char *arg_1, char *arg_2){

    int **lvst_grid = lvst(arg_1, arg_2);
    int rows = (int)strlen(arg_1);
    int cols = (int)strlen(arg_2);

    for (int row = 0; row <= rows; row++){
        for (int col = 0; col <= cols; col++) {
            printf("%i ", lvst_grid[row][col]);
        }
        printf("\n");
    }
    printf("Difference = %i\n", lvst_grid[rows][cols]);

    clean_grid(lvst_grid, rows);
}


/* Checks database for an inputted value and prints the conclusion.
   If the exact value is not found, the program will display
   three strings with the three lowest Levensteihn distances.
*/
void retrieve(char* str){
    if (DB_SIZE == 0) {
        printf("No match found; database is empty\n");
        return;
    }

    // Checks if value is found, otherwise creates an array with distances.
    int distance[DB_SIZE];
    for (int i = 0; i < DB_SIZE; i++) {

        if (strcmp(str, DATABASE[i]) == 0){
            printf("Perfect match found; ""%s"" is in database\n", str);
            return;
        }
        else {

            int** grid = lvst(str, DATABASE[i]);
            distance[i] = grid[strlen(str)][strlen(DATABASE[i])];
            clean_grid(grid, (int) strlen(str));
        }
    }

    int dist_copy[DB_SIZE];
    for (int l = 0; l < DB_SIZE; l++) {
        dist_copy[l] = distance[l];
    }

    /* Finds the lowest distances in an array and removes it from array.
       Repeat to find the three lowest distances.
      'match_amount' is the amount of displayed distances.
    */
    int match_amount;
    if (DB_SIZE < 3) {
        match_amount = DB_SIZE;
    } else {
        match_amount = 3;
    }

    int matches[match_amount];
    for (int match = 0; match < match_amount; match++) {

        int lowest_idx = 0;
        for (int j = 0; j < DB_SIZE; j++){
            if (dist_copy[j] < dist_copy[lowest_idx]) {
                lowest_idx = j;
            }
        }

        // Saves lowest distance and removes saved value from array by
        // making it a very high number.
        matches[match] = dist_copy[lowest_idx];
        dist_copy[lowest_idx] = MAX_INPUT_SIZE;
    }

    printf("No perfect match found; ""%s"" is not in database\n", str);
    printf("Best matches:\nDistance\tString\n");
    for (int match = 0; match < match_amount; match++) {
        for (int k = 0; k < DB_SIZE; k++){

            if (distance[k] == matches[match]) {
                printf("%d\t\t%s \n", distance[k], DATABASE[k]);
                distance[k] = MAX_INPUT_SIZE;
                break;
            }
        }
    }
}

// Prints the amount of items in the database.
void size(void) {
    printf("%i items in database\n", DB_SIZE);
}

// Lists all the usable commands and its functions.
void commands(void){
    printf("LIST OF COMMANDS...\n");
    fprintf(stdout, "add     ...       add to database \n"
                    "compare ...       compare two strings \n"
                    "help    ...       print this text \n"
                    "list    ...       print database \n"
                    "read    ...       read from file and add to database \n"
                    "remove  ...       remove from database \n"
                    "retrieve...       find in database \n"
                    "size    ...       print number of items in database \n"
                    "quit    ...       stop \n");
    return;
}

// Checks if the input has the correct call name and amount of arguments.
void cmd(char *action, char* arg_1, char* arg_2, int args){
        if (strcmp(action, "quit") == 0) {
            printf("Exiting program\n");
            clean_db();
            exit(1);
        } else if (strcmp(action, "help") == 0 && args == 1) {
            commands();
        } else if (strcmp(action, "list") == 0 && args == 1) {
            list();
        } else if(strcmp(action, "size") == 0 && args == 1) {
            size();
        } else if(strcmp(action, "read") == 0 && args == 2) {
            read(arg_1);
        } else if (strcmp(action, "add") == 0 && args == 2) {
            add(arg_1);
        } else if (strcmp(action, "remove") == 0 && args == 2) {
            delete(arg_1);
        } else if (strcmp(action, "retrieve") == 0 && args == 2) {
            retrieve(arg_1);
        } else if (strcmp(action, "compare") == 0 && args == 3) {
            compare(arg_1, arg_2);
        } else {
            printf("Please enter a valid command\n");
            return;
        }
}

/*  Checks the input size and cuts it into seperate strings.
    Also determines the amount of arguments given.
    Keeps asking for input until user quits the program.
*/
int main(void){
    printf("Welcome to DNA Matcher v0.2\n");
    DATABASE = malloc(MAX_DB_SIZE* sizeof(char*));

    while(1) {
        printf("console> ");
        char input[MAX_INPUT_SIZE];
        if (fgets(input, MAX_INPUT_SIZE, stdin) == NULL) {
            printf("Non valid input! \n");
            exit(1);
        }

        // Converts uppercase letters to lowercase letters.
        for (int idx = 0; idx < (int)strlen(input); idx++) {
            if (input[idx] >= 'A' && input[idx] <= 'Z') {
                input[idx] += 32;
            }
        }

        // Counts amount of arguments.
        int arg_amount = 1;
        for (int letters = 0; letters < ((int)strlen(input)); letters++) {

            // ASCCI-code for space
            if (input[letters] == 32) {
                arg_amount++;
            }
        }

        char *action = strtok(input, " \n");
        char *arg_1 = strtok(NULL, " \n");
        char *arg_2 = strtok(NULL, " \n");
        cmd(action, arg_1, arg_2, arg_amount);
    }
}