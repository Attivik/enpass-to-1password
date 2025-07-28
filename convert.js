const fs = require('fs');
const args = process.argv;
const inputFile = args[2] || 'vault.json';
const outputFile = args[3] || 'vault.csv';

console.log('\nREADING: ' + inputFile + '\n');

try {
    const contents = fs.readFileSync(inputFile);
    const vault = JSON.parse(contents);
    let notConverted = 0;
    let converted = 0;

    const csvOutput = ['title,website,username,password,notes,category'];
    const fieldMapping = {
        title: 'title',
        url: 'website',
        username: 'username',
        password: 'password',
        notes: 'notes',
        email: 'email',
        category: 'category'
    };

    vault.items.forEach(item => {
        if (
            item.category === 'login'
            || item.category === 'password'
            || item.category === 'note'
            || item.category === 'uncategorized'
        ) {
            const rowData = {
                title: item.title,
                website: '',
                username: '',
                password: '',
                notes: item.note,
                category: item.category
            };

            Object.keys(fieldMapping).forEach(type => {
                const key = fieldMapping[type];
                if (item.fields !== undefined) {
                    item.fields.forEach(field => {
                        if (field.type === type) {
                            if (field.value && !rowData[key]) {
                                if (field.value === 'url') {
                                    rowData['website'] = field.value;
                                } else if (field.type === 'email') {
                                    if (!rowData['username']) {
                                        rowData['username'] = field.value;
                                    } else if (field.value != '') {
                                        rowData['notes'] += `\n\nEmail: ${field.value}\n\n`;
                                    }
                                } else {
                                    rowData[key] += field.value;
                                }
                            }
                        }
                    });
                } 
            });

            csvOutput.push(
                Object.keys(rowData)
                .map(key => '"' + (key == 'password' ? rowData[key].replaceAll('"', '""') : rowData[key].replaceAll('"', '""').replaceAll("\n\n\n\n", "\n\n").trim()) + '"')
                .join(','),
            );

            converted++
        } else {
            notConverted++
            console.log('NOT CONVERTED: ', item.title, ' - ', item.category)
        }
    });

    console.log('WRITING: ' + outputFile + '\n');
    console.log('SUCCESSFUL: ', converted, ' items. ')
    console.log('FAILED: ', notConverted, ' items. ')
    fs.writeFileSync(outputFile, csvOutput.join('\n'));
} catch (err) {
    throw err;
}
